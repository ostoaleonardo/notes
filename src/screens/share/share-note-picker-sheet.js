import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { ListSheet } from '@/ui/modal/list-sheet'
import { useTheme } from '@/ui/hooks/use-theme'

import { useNotes } from '@/hooks/use-notes'
import { sortNotes } from '@/utils/note-sort'

import { NOTE_SORTS } from '@/constants/note-sort'

const PickerItem = memo(({ item, onPress }) => {
    const { colors } = useTheme()
    const handlePress = useCallback(() => onPress(item), [onPress, item])

    return (
        <ListItem
            uppercase={false}
            title={item.title}
            background={colors.surfaceVariant}
            onPress={handlePress}
        />
    )
})

export const ShareNotePickerSheet = memo(({ sheet, onSelect }) => {
    const { t } = useTranslation()
    const { notes } = useNotes()

    const sorted = useMemo(() => sortNotes(notes, NOTE_SORTS.MODIFIED_DESC), [notes])

    const onPress = useCallback((note) => {
        sheet.onClose()
        onSelect(note)
    }, [sheet, onSelect])

    const renderItem = useCallback(({ item }) => (
        <PickerItem
            item={item}
            onPress={onPress}
        />
    ), [onPress])

    return (
        <ListSheet
            sheet={sheet}
            title={t('share.choose_note')}
            data={sorted}
            renderItem={renderItem}
            keyExtractor={getNoteKey}
        />
    )
})

const getNoteKey = (item) => item.path
