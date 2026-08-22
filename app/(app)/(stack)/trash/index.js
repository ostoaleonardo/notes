import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AppBarAction } from '@/components'
import { TrashContainer } from '@/screens/home'
import { useAppBarTrailing, useNotes, useTrash } from '@/hooks'
import { Delete } from '@/icons'

export default function Trash() {
    const { t } = useTranslation()

    const { saveNote } = useNotes()
    const { loading, trash, deleteItem, clearAll } = useTrash()
    const [selected, setSelected] = useState(null)

    useAppBarTrailing((
        <AppBarAction
            tooltip={t('header.trash')}
            onPress={clearAll}
            icon={Delete}
        />
    ))

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
