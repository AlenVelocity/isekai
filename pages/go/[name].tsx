/* eslint-disable @next/next/no-img-element */
import { Component } from 'react'
import Head from '../../components/Head'
import Nav from '../../components/Nav'
import Loading from '../../components/Loading'

import { KalidokitController } from '../../helpers/KalidokitController'
import { withRouter, Router } from 'next/router'
import { WithRouterProps } from 'next/dist/client/with-router'

interface Props extends WithRouterProps {
    router: Router
}

class Home extends Component<Props, { isLoading: boolean; progress: number }> {
    constructor(props: any) {
        super(props)
        this.state = {
            isLoading: true,
            progress: 0
        }
    }
    public async componentDidMount() {
        const input = document.getElementById('video-in') as HTMLVideoElement
        const kalidokit = new KalidokitController(
            input,
            `/${this.props.router.query.name}.vrm`,
            document.getElementById('canvas') as HTMLCanvasElement
        )
        await kalidokit.init((progress) => {
            this.setState({
                progress: Math.floor(100.0 * (progress.loaded / progress.total))
            })
        })
        this.setState({ isLoading: false })
    }

    public render() {
        return (
            <div className="main">
                <Head />
                <main>
                    <Nav />
                    {this.state.isLoading ? <Loading progress={this.state.progress ?? 0} /> : ''}
                    <div className="cursor-move flex absolute overflow-hidden rounded-lg transform scale-x-[-1]">
                        <video
                            id="video-in"
                            className="h-auto max-w-xs bg-gray-100"
                            width="1280px"
                            height="720px"
                        ></video>
                        <canvas id="canvas" className="block absolute bottom-0 left-0 h-auto w-full z-1"></canvas>
                    </div>
                </main>
            </div>
        )
    }
}

export default withRouter(Home)
