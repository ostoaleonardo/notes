import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { EmptyMessage } from './empty-message'
import { GroupedList, GroupSeparator } from '@/components/grouped-list'
import { ModalBottomSheet } from './modal-bottom-sheet'
import { SheetTitle } from './sheet-title'

import { SHEET } from '@/constants/components'
import { SPACING } from '@/constants/theme'

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

    return (
        <ModalBottomSheet
            key={isEmpty ? 'empty' : 'list'}
            ref={sheet.ref}
            onClose={sheet.onClose}
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
                    component={FlatList}
                    data={data}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={GroupSeparator}
                    renderItem={renderItem}
                />
            )}
        </ModalBottomSheet>
    )
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg
    },
    empty: {
        paddingVertical: SPACING.xxxl,
        paddingHorizontal: SPACING.lg
    }
})
