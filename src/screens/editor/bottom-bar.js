import { BottomEditorBar } from './bottom-bar/bottom-editor-bar'

export function BottomBar({
    images, setImages,
    hasPassword, onOpenPassword
}) {
    const onAddImage = (image) => {
        setImages([...images, image])
    }

    return (
        <BottomEditorBar
            onAddImage={onAddImage}
            hasPassword={hasPassword}
            onOpenPassword={onOpenPassword}
        />
    )
}
