import { Utils, Vector, Face, Pose, Hand, XYZ } from 'kalidokit'
import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import { HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, Results } from '@mediapipe/holistic'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Camera } from '@mediapipe/camera_utils'

const { clamp } = Utils
const { lerp } = Vector

type TFace = NonNullable<ReturnType<typeof Face['solve']>>

export class KalidokitController {
    private loader = new GLTFLoader()

    private orbitCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)

    private renderer = new THREE.WebGLRenderer({
        alpha: true
    })

    private orbitControls = new OrbitControls(this.orbitCamera, this.renderer.domElement)

    public scene = new THREE.Scene()

    public clock = new THREE.Clock()

    private currentVRM?: VRM

    private oldLookTarget = new THREE.Euler()

    constructor(
        public readonly video: HTMLVideoElement,
        public readonly model: string,
        public readonly canvas: HTMLCanvasElement
    ) {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        document.body.appendChild(this.renderer.domElement)

        this.orbitCamera.position.set(0.0, 1.4, 0.7)

        this.orbitControls.screenSpacePanning = true
        this.orbitControls.target.set(0.0, 1.4, 0.0)
        this.orbitControls.update()

        const light = new THREE.DirectionalLight(0xffffff)
        light.position.set(1.0, 1.0, 1.0).normalize()
        this.scene.add(light)
        this.animate()
    }

    public init = async (onProgress: (event: ProgressEvent<EventTarget>) => void) => {
        const gltf = await this.load(onProgress)
        VRMUtils.removeUnnecessaryJoints(gltf.scene)
        const vrm = await VRM.from(gltf)
        this.scene.add(vrm.scene)
        this.currentVRM = vrm
        this.currentVRM.scene.rotation.y = Math.PI
        const holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`
            }
        })
        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            refineFaceLandmarks: true
        })
        holistic.onResults((results) => {
            this.drawResults(results)
            this.animateVRM(this.currentVRM!, results)
        })

        const camera = new Camera(this.video, {
            onFrame: async () => {
                await holistic.send({ image: this.video })
            },
            width: 640,
            height: 480
        })
        camera.start()
    }

    public update = (delta: number) => {
        this.currentVRM?.update(delta)
    }

    public animate = () => {
        requestAnimationFrame(this.animate)
        this.update(this.clock.getDelta())
        this.renderer.render(this.scene, this.orbitCamera)
    }

    private load(onProgress: (event: ProgressEvent<EventTarget>) => void) {
        this.loader.crossOrigin = 'anonymous'
        return new Promise<GLTF>((resolve, reject) =>
            this.loader.load(
                this.model,
                async (gltf) => {
                    resolve(gltf)
                },

                onProgress,

                (error) => {
                    reject(error)
                }
            )
        )
    }

    public rigRotation = (name: string, x = 0, y = 0, z = 0, dampener = 1, lerpAmt = 0.3) => {
        if (!this.currentVRM) return void null
        const Part = this.currentVRM.humanoid?.getBoneNode(
            VRMSchema.HumanoidBoneName[name as keyof typeof VRMSchema.HumanoidBoneName]
        )
        if (!Part) return void null

        let euler = new THREE.Euler(x * dampener, y * dampener, z * dampener)
        let quaternion = new THREE.Quaternion().setFromEuler(euler)
        Part.quaternion.slerp(quaternion, lerpAmt)
    }

    public rigPosition = (name: string, x = 0, y = 0, z = 0, dampener = 1, lerpAmt = 0.3) => {
        if (!this.currentVRM) return void null
        const Part = this.currentVRM.humanoid?.getBoneNode(
            VRMSchema.HumanoidBoneName[name as keyof typeof VRMSchema.HumanoidBoneName]
        )
        if (!Part) return
        let vector = new THREE.Vector3(x * dampener, y * dampener, z * dampener)
        Part.position.lerp(vector, lerpAmt)
    }

    public rigFace = (riggedFace: TFace) => {
        if (!this.currentVRM) return void null
        this.rigRotation('Neck', riggedFace?.head.x, riggedFace?.head.y, riggedFace?.head.z, 0.7)

        const Blendshape = this.currentVRM.blendShapeProxy!
        const PresetName = VRMSchema.BlendShapePresetName

        riggedFace.eye.l = lerp(clamp(1 - riggedFace.eye.l, 0, 1), Blendshape.getValue(PresetName.Blink) as number, 0.5)
        riggedFace.eye.r = lerp(clamp(1 - riggedFace.eye.r, 0, 1), Blendshape.getValue(PresetName.Blink) as number, 0.5)
        riggedFace.eye = Face.stabilizeBlink(riggedFace.eye, riggedFace.head.y)
        Blendshape.setValue(PresetName.Blink, riggedFace.eye.l)

        for (const letter of ['I', 'E', 'A', 'O', 'U'] as const)
            Blendshape.setValue(
                PresetName[letter],
                lerp(riggedFace.mouth.shape.I, Blendshape.getValue(PresetName[letter]) as number, 0.5)
            )

        const lookTarget = new THREE.Euler(
            lerp(this.oldLookTarget.x, riggedFace.pupil.y, 0.4),
            lerp(this.oldLookTarget.y, riggedFace.pupil.x, 0.4),
            0,
            'XYZ'
        )
        this.oldLookTarget.copy(lookTarget)
        this.currentVRM.lookAt?.applyer?.lookAt(lookTarget)
    }

    public animateVRM = (
        vrm: VRM,
        {
            faceLandmarks,
            ea: pose3DLandmarks,
            poseLandmarks: pose2DLandmarks,
            rightHandLandmarks: leftHandLandmarks,
            leftHandLandmarks: rightHandLandmarks
        }: any
    ) => {
        if (!vrm) return void null
        if (faceLandmarks) {
            const riggedFace = Face.solve(faceLandmarks, {
                runtime: 'mediapipe',
                video: this.video
            })!
            this.rigFace(riggedFace)
        }

        if (pose2DLandmarks && pose3DLandmarks) {
            const riggedPose = Pose.solve(pose3DLandmarks, pose2DLandmarks, {
                runtime: 'mediapipe',
                video: this.video
            })!
            this.rigRotation(
                'Hips',
                riggedPose.Hips.rotation?.x,
                riggedPose.Hips.rotation?.y,
                riggedPose.Hips.rotation?.z,
                0.7
            )
            this.rigPosition(
                'Hips',
                -riggedPose.Hips.position.x,
                riggedPose.Hips.position.y + 1,
                -riggedPose.Hips.position.z,
                1,
                0.07
            )

            this.rigRotation('Chest', riggedPose.Spine.x, riggedPose.Spine.y, riggedPose.Spine.z, 0.25, 0.3)
            this.rigRotation('Spine', riggedPose.Spine.x, riggedPose.Spine.y, riggedPose.Spine.z, 0.45, 0.3)

            for (const l of [
                'RightUpperArm',
                'RightLowerArm',
                'LeftUpperArm',
                'LeftLowerArm',
                'RightUpperLeg',
                'RightLowerLeg',
                'LeftUpperLeg',
                'LeftLowerLeg'
            ] as const) {
                const { x, y, z } = riggedPose[l]
                this.rigRotation(l, x, y, z, 1, 0.3)
            }

            if (leftHandLandmarks) {
                const riggedHand = Hand.solve(leftHandLandmarks, 'Left')!
                this.rigRotation('LeftHand', riggedHand.LeftWrist.x, riggedHand.LeftWrist.y, riggedPose.LeftHand.z)

                for (const l of [
                    'LeftThumbProximal',
                    'LeftThumbIntermediate',
                    'LeftThumbDistal',
                    'LeftIndexProximal',
                    'LeftIndexIntermediate',
                    'LeftIndexDistal',
                    'LeftMiddleProximal',
                    'LeftMiddleIntermediate',
                    'LeftMiddleDistal',
                    'LeftRingProximal',
                    'LeftRingIntermediate',
                    'LeftRingDistal',
                    'LeftLittleProximal',
                    'LeftLittleIntermediate',
                    'LeftLittleDistal'
                ] as const) {
                    const { x, y, z } = riggedHand[l]
                    this.rigRotation(l, x, y, z)
                }
            }

            if (rightHandLandmarks) {
                console.log(rightHandLandmarks)
                const riggedHand = Hand.solve(rightHandLandmarks, 'Right')!
                console.log(riggedHand)
                this.rigRotation('RightHand', riggedHand.RightWrist.x, riggedHand.RightWrist.y, riggedPose.RightHand.z)

                for (const l of [
                    'RightThumbProximal',
                    'RightThumbIntermediate',
                    'RightThumbDistal',
                    'RightIndexProximal',
                    'RightIndexIntermediate',
                    'RightIndexDistal',
                    'RightMiddleProximal',
                    'RightMiddleIntermediate',
                    'RightMiddleDistal',
                    'RightRingProximal',
                    'RightRingIntermediate',
                    'RightRingDistal',
                    'RightLittleProximal',
                    'RightLittleIntermediate',
                    'RightLittleDistal'
                ] as const) {
                    const { x, y, z } = riggedHand[l]
                    this.rigRotation(l, x, y, z)
                }
            }
        }
    }

    public drawResults = (results: any) => {
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight
        const ctx = this.canvas.getContext('2d')!
        ctx.save()
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // Use `Mediapipe` drawing functions
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00cff7',
            lineWidth: 4
        })
        drawLandmarks(ctx, results.poseLandmarks, {
            color: '#ff0364',
            lineWidth: 2
        })
        drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, {
            color: '#C0C0C070',
            lineWidth: 1
        })
        if (results.faceLandmarks && results.faceLandmarks.length === 478) {
            //draw pupils
            drawLandmarks(ctx, [results.faceLandmarks[468], results.faceLandmarks[468 + 5]], {
                color: '#ffe603',
                lineWidth: 2
            })
        }
        drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
            color: '#eb1064',
            lineWidth: 5
        })
        drawLandmarks(ctx, results.leftHandLandmarks, {
            color: '#00cff7',
            lineWidth: 2
        })
        drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
            color: '#22c3e3',
            lineWidth: 5
        })
        drawLandmarks(ctx, results.rightHandLandmarks, {
            color: '#ff0364',
            lineWidth: 2
        })
    }
}
