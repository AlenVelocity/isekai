/* eslint-disable @next/next/no-img-element */
import { Component } from 'react'
import Head from '../components/Head'
import Isekai from '../components/Isekai'
import ModelCard from '../components/ModelCard'

class Home extends Component<{}, { isLoading: boolean; progress: number }> {
    constructor(props: any) {
        super(props)
        this.state = {
            isLoading: true,
            progress: 0
        }
    }
    public async componentDidMount() {}

    public render() {
        return (
            <div>
                <Head />
                <div className="bg-red-200 py-24 flex flex-wrap items-center justify-center">
                    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 items-center justify-center">
                        <p className="text-2xl text-black bottom-10 font-bold text-center">
                            Choose a model to get Isekai&apos;d as
                        </p>
                    </div>
                </div>

                {/** flex grid with 1x2*/}
                <div className="bg-red-300 py-24 flex flex-wrap items-center justify-center gap-4">
                    <ModelCard name="Latifa" />
                </div>
            </div>
        )
    }
}

export default Home
