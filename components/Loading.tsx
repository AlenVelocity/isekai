import { FC } from 'react'

const Loading: FC<{ progress?: number }> = ({ progress = 0 }) => {
    // display progress bar in the middle
    return (
        <div className="h-2 w-full bg-gray-300 rounded overflow-hidden shadow-lg mx-auto">
            <div
                style={{ width: `${progress}%` }}
                className={`h-full ${progress < 70 ? 'bg-red-600' : 'bg-green-600'}`}
            ></div>
        </div>
    )
}

export default Loading
