import { useState } from 'react'
import { Image, useWindowDimensions } from 'react-native'
import { fitContainer } from 'react-native-zoom-toolkit'

export const GalleryImage = ({ uri }) => {
    const { width, height } = useWindowDimensions()
    const [resolution, setResolution] = useState({ width: 1, height: 1 })

    const size = fitContainer(resolution.width / resolution.height, { width, height })

    return (
        <Image
            source={{ uri }}
            style={size}
            resizeMethod='scale'
            resizeMode='cover'
            onLoad={(e) => {
                setResolution({
                    width: e.nativeEvent.source.width,
                    height: e.nativeEvent.source.height,
                })
            }}
        />
    )
}
