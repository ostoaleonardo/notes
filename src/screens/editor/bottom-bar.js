import { BottomEditorBar } from './bottom-bar/bottom-editor-bar'
import { BottomListBar } from './bottom-bar/bottom-list-bar'
import { useList } from '@/hooks'

export function BottomBar({
    list, setList,
    images, setImages,
    hasPassword, onOpenPassword,
    showEditor, setShowEditor
}) {
    const { onListType } = useList(list, setList)

    const onAddImage = (image) => {
        setImages([...images, image])
    }

    return (
        showEditor ? (
            <BottomEditorBar
                onAddImage={onAddImage}
                hasPassword={hasPassword}
                onOpenPassword={onOpenPassword}
                onToggleEditor={() => setShowEditor(false)}
            />
        ) : (
            <BottomListBar
                onShowEditor={() => setShowEditor(true)}
                onListType={onListType}
            />
        )
    )
}
