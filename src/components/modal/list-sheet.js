import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { ModalSheet } from './modal-sheet'
import { Typography } from '@/components/typography'

import { OPACITY, SPACING } from '@/constants/theme'
import { SHEET } from '@/constants/components'

export function ListSheet({
    sheet,
    onChange,
    data,
    renderItem,
    keyExtractor,
    emptyMessage
}) {
    const empty = useMemo(() => (
        <View style={styles.empty}>
            <Typography opacity={OPACITY.muted}>
                {emptyMessage}
            </Typography>
        </View>
    ), [emptyMessage])

    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            onChange={onChange}
            snapPoints={SHEET.snapPoints.tall}
        >
            <FlatList
                data={data}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                ListEmptyComponent={empty}
            />
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: SPACING.lg
    },
    empty: {
        paddingTop: SHEET.topPadding,
        alignItems: 'center'
    }
})
