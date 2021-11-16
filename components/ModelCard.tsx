/* eslint-disable @next/next/no-img-element */
import { FC } from 'react'
import router from 'next/router'

const ModelCard: FC<{ name: string }> = ({ name }) => {
    const handleClick = () => {
        router.push(`/go/${name}`)
    }

    return (
        <div className="bg-red-200 rounded-lg shadow-2xl w-3/4 max-w-xs">
            <img src={`/${name}-Thumb.jpeg`} alt="avatar" className="rounded-t-lg h-60 w-full object-cover" />

            <div className="p-8">
                <h2 className="text-2xl font-extrabold mb-5">{name}</h2>
                <button
                    onClick={handleClick}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Go!
                </button>
            </div>
        </div>
    )
}

export default ModelCard
