import { FC } from 'react'
import H from 'next/head'

const Head: FC<Partial<Record<'title' | 'description' | 'url' | 'image' | 'type' | 'siteName' | 'twitter', string>>> = ({ title = 'Isekai', description = "Get Isekai'd", url = 'https://isekai.vercel.app', image = '/image.png' }) => {
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
