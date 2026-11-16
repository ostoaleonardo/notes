import { router, useLocalSearchParams } from 'expo-router'

import { ImageViewer } from '@/features/editor/native/screens/notes/image-viewer'

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
