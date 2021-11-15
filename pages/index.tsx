import { Component } from 'react'
import { KalidokitController } from '../helpers/KalidokitController'
import Head from '../components/Head'
class Home extends Component {
    public componentDidMount() {
        const input = document.getElementById('video-in') as HTMLVideoElement
        const kalidokit = new KalidokitController(
            input,
            '/Latifa.vrm',
            document.getElementById('canvas') as HTMLCanvasElement
        )
        kalidokit.init()
    }

    public render() {
        // max width 300px tailwind class is 
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Head/>
                <main>
                <div className="preview">
                    <video id='video-in' className="input_video" width="1280px" height="720px"></video>
                    <canvas id='canvas' className="canva"></canvas>
                </div>
                </main>
            </div>
        )
    }
}

export default Home
