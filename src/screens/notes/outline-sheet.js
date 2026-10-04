import { memo, useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { ModalSheet } from '@/components/modal/modal-sheet'
import { Typography } from '@/components/typography'

import { buildOutline, findHeadings, getVisibleOutline } from '@/utils/headings'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'

import {
    HEADING_OUTLINE_CHEVRON_SIZE,
    HEADING_OUTLINE_GUIDE_WIDTH,
    HEADING_OUTLINE_INDENT
} from '@/constants/headings'
import { SHEET_SNAP_POINTS } from '@/constants/sheet'
import { SPACING } from '@/constants/spacing'
import { TRANSPARENT } from '@/constants/themes'

const guideOffset = (level) => (
    SPACING.lg + level * HEADING_OUTLINE_INDENT + HEADING_OUTLINE_CHEVRON_SIZE / 2
)

const OutlineItem = memo(function OutlineItem({ item, collapsed, onPress, onToggle }) {
    const { colors } = useTheme()

    return (
        <Pressable
            accessibilityRole='button'
            onPress={() => onPress(item.index)}
            android_ripple={{ color: colors.onBackground + TRANSPARENT[10] }}
            style={styles.item}
        >
            {Array.from({ length: item.depth }, (_, level) => (
                <View
                    key={level}
                    style={[
                        styles.guide,
                        { left: guideOffset(level), backgroundColor: colors.onBackground + TRANSPARENT[10] }
                    ]}
                />
            ))}

            <View style={{ marginLeft: item.depth * HEADING_OUTLINE_INDENT }}>
                {item.hasChildren ? (
                    <Pressable
                        hitSlop={SPACING.sm}
                        onPress={() => onToggle(item.index)}
                        style={[styles.chevron, collapsed && styles.collapsed]}
                    >
                        <KeyboardArrowDown
                            width={HEADING_OUTLINE_CHEVRON_SIZE}
                            height={HEADING_OUTLINE_CHEVRON_SIZE}
                            color={colors.onBackground + TRANSPARENT[50]}
                        />
                    </Pressable>
                ) : (
                    <View style={styles.chevron} />
                )}
            </View>

            <Typography
                bold={item.depth === 0}
                styleProps={styles.text}
            >
                {item.text}
            </Typography>
        </Pressable>
    )
})

export const OutlineSheet = memo(function OutlineSheet({ sheet, contentRef, onSelect }) {
    const { t } = useTranslation()
    const [outline, setOutline] = useState([])
    const [collapsed, setCollapsed] = useState(() => new Set())

    const items = useMemo(() => getVisibleOutline(outline, collapsed), [outline, collapsed])

    const onChange = useCallback((index) => {
        if (index < 0) return

        setCollapsed(new Set())
        setOutline(buildOutline(findHeadings(contentRef.current.content || '')))
    }, [contentRef])

    const onPress = useCallback((index) => {
        sheet.onClose()
        onSelect(index)
    }, [sheet, onSelect])

    const onToggle = useCallback((index) => {
        setCollapsed((prev) => {
            const next = new Set(prev)
            if (!next.delete(index)) next.add(index)
            return next
        })
    }, [])

    const renderItem = useCallback(({ item }) => (
        <OutlineItem
            item={item}
            collapsed={collapsed.has(item.index)}
            onPress={onPress}
            onToggle={onToggle}
        />
    ), [collapsed, onPress, onToggle])

    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            onChange={onChange}
            snapPoints={SHEET_SNAP_POINTS.TALL}
        >
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.index)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                ListEmptyComponent={(
                    <View style={styles.empty}>
                        <Typography opacity={0.5}>
                            {t('message.outline.empty')}
                        </Typography>
                    </View>
                )}
            />
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    list: {
        paddingBottom: SPACING.lg
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg
    },
    guide: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: HEADING_OUTLINE_GUIDE_WIDTH
    },
    chevron: {
        width: HEADING_OUTLINE_CHEVRON_SIZE,
        height: HEADING_OUTLINE_CHEVRON_SIZE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    collapsed: {
        transform: [{ rotate: '-90deg' }]
    },
    text: {
        flex: 1,
        marginLeft: SPACING.sm
    },
    empty: {
        paddingTop: 64,
        alignItems: 'center'
    }
})
