import { useState } from 'react'
import { View } from 'react-native'
import { TrashContainer } from '@/screens/home'
import { useNotes, useTrash } from '@/hooks'

export default function Trash() {
    const { loading, trash, deleteItem } = useTrash()
    const { saveNote } = useNotes()
    const [selected, setSelected] = useState(null)

    const onRestore = (item) => {
        deleteItem(item)
        saveNote(item)
    }

    return (
        <View style={{ flex: 1 }}>
            <TrashContainer
                loading={loading}
                notes={Array.from(trash)}
                onDelete={(item) => deleteItem(item)}
                onRestore={onRestore}
                selected={selected}
                setSelected={setSelected}
            />
        </View>
    )
}
