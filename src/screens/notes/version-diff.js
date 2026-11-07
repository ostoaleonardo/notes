import { memo, useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'

import { LoadingOverlay } from '@/ui/layout'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useVersionDiff } from '@/hooks/use-version-diff'

import { DIFF_ADDED_COLOR, DIFF_REMOVED_COLOR, DIFF_TYPES } from '@/constants/diff'
import { TRANSPARENT } from '@/constants/themes'
import { FONTS, RADIUS, SPACING, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

const DIFF_PREFIXES = {
    [DIFF_TYPES.ADDED]: '+ ',
    [DIFF_TYPES.REMOVED]: '- ',
    [DIFF_TYPES.UNCHANGED]: '  '
}

const getDiffColor = (type) => (type === DIFF_TYPES.ADDED ? DIFF_ADDED_COLOR : DIFF_REMOVED_COLOR)

const keyExtractor = (_, index) => String(index)

export const VersionDiff = memo(({ version, currentContentRef }) => {
    const { colors } = useTheme()
    const diff = useVersionDiff(version, currentContentRef)

    const renderItem = useCallback(({ item: entry }) => {
        const isChanged = entry.type !== DIFF_TYPES.UNCHANGED
        const background = isChanged
            ? getDiffColor(entry.type) + TRANSPARENT[20]
            : 'transparent'

        return (
            <View style={{ ...styles.line, backgroundColor: background }}>
                <Typography
                    color={isChanged ? getDiffColor(entry.type) : colors.onBackground}
                    styleProps={styles.text}
                >
                    {DIFF_PREFIXES[entry.type] + entry.line}
                </Typography>
            </View>
        )
    }, [colors.onBackground])

    if (!diff) return <LoadingOverlay background={false} />

    return (
        <FlatList
            data={diff}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            style={styles.diff}
            renderItem={renderItem}
        />
    )
})

const styles = StyleSheet.create({
    diff: {
        flex: 1,
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.lg
    },
    line: {
        paddingVertical: SPACING.xxxs,
        paddingHorizontal: SPACING.xxs
    },
    text: {
        fontFamily: FONTS.azeretLight,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall
    }
})
