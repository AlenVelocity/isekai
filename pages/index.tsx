/* eslint-disable @next/next/no-img-element */
import { Component } from 'react'
import { KalidokitController } from '../helpers/KalidokitController'
import Head from '../components/Head'
import Isekai from '../components/Isekai'
class Home extends Component<{}, { isLoading: boolean }> {
    constructor(props: any) {
        super(props)
        this.state = {
            isLoading: true
        }
        this.setState({ isLoading: true })
    }
    public async componentDidMount() {
        const input = document.getElementById('video-in') as HTMLVideoElement
        const kalidokit = new KalidokitController(
            input,
            '/Latifa.vrm',
            document.getElementById('canvas') as HTMLCanvasElement
        )
        await kalidokit.init()
        this.setState({ isLoading: false })
        this.setState({ isLoading: false })
    }

    public render() {
        // max width 300px tailwind class is
        return (
            <div className="main">
                <Head />
                <main>
                    <h1 className="notranslate">
                        <a href="https://isekai.vecrel.app">
                            <Isekai />
                        </a>
                    </h1>
                    <nav>
                        <a href="https://github.com/alensaito1/isekai">
                            <img
                                alt="github"
                                src="https://cdn.glitch.me/447b6603-7eae-4da6-957d-73ee30c8e731%2Fgithub.png?v=1635133310517"
                            />
                        </a>
                    </nav>
                    {this.state.isLoading ? <div className="loader">Loading...</div> : ''}
                    <div className="preview">
                        <video id="video-in" className="input_video" width="1280px" height="720px"></video>
                        <canvas id="canvas" className="canva"></canvas>
                    </div>
                </main>
            </div>
        )
    }
}

export default Home
