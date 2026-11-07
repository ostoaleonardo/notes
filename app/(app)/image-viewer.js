import { router, useLocalSearchParams } from 'expo-router'

import { ImageViewer } from '@/screens/notes/image-viewer'

const onClose = () => router.back()

export default function ImageViewerScreen() {
    const { url } = useLocalSearchParams()

    return (
        <ImageViewer
            url={url}
            onClose={onClose}
        />
    )
}
