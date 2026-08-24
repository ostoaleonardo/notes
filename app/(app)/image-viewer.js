import { router, useLocalSearchParams } from 'expo-router'
import { ImageViewer } from '@/screens/notes'

export default function ImageViewerScreen() {
    const { url } = useLocalSearchParams()

    return <ImageViewer url={url} onClose={() => router.back()} />
}
