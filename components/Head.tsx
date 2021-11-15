import { FC } from 'react'
import H from 'next/head'

type Data = Partial<Record<'title' | 'description' | 'url' | 'image' | 'type' | 'siteName' | 'twitter', string>>

const Head: FC<Data> = ({ title = 'Isekai', description = 'Get Isekai\'d', url, image }) => {
    return (
        <H>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />
        </H>
    )
}

export default Head
