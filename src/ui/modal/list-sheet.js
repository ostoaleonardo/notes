import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { EmptyMessage } from './empty-message'
import { GroupedList, GroupSeparator } from '@/ui/grouped-list'
import { ModalBottomSheet } from './modal-bottom-sheet'
import { SheetTitle } from './sheet-title'

import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'

import { SHEET } from '@/ui/tokens/components'
import { SPACING } from '@/ui/tokens/theme'

export function ListSheet({
    sheet,
    title,
    onChange,
    data,
    renderItem,
    keyExtractor,
    emptyMessage
}) {
    const isEmpty = data.length === 0
    const bottom = useSheetBottomSpacing()

    return (
        <ModalBottomSheet
            key={isEmpty ? 'empty' : 'list'}
            ref={sheet.ref}
            onChange={onChange}
            enableDynamicSizing={isEmpty}
            snapPoints={isEmpty ? undefined : SHEET.snapPoints.tall}
        >
            {title && <SheetTitle>{title}</SheetTitle>}

            {isEmpty ? (
                <EmptyMessage style={styles.empty}>
                    {emptyMessage}
                </EmptyMessage>
            ) : (
                <GroupedList
                    paged={true}
                    component={FlatList}
                    data={data}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.list, { paddingBottom: bottom }]}
                    ItemSeparatorComponent={GroupSeparator}
                    renderItem={renderItem}
                />
            )}
        </ModalBottomSheet>
    )
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: SPACING.lg
    },
    empty: {
        paddingVertical: SPACING.xxxl,
        paddingHorizontal: SPACING.lg
    }
})
