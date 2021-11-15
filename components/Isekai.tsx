import { FC, useEffect, useState } from 'react'

const DecoderText: FC = () => {
    const [decodedText, setDecodedText] = useState('いせかい')
    const text = 'Isekai'
    const { length } = text

    let dc = decodedText.split('')
    useEffect(() => {
        const interval = setInterval(async () => {
            for (let i = 0; i < length; i++) {
                await new Promise<void>((resolve) =>
                    setTimeout(() => {
                        dc[i] = text[i]
                        setDecodedText(dc.join(''))
                        resolve()
                    }, 100)
                )
            }
        }, 100)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <div>{decodedText}</div>
}

export default DecoderText
