import { memo, useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { ListItem } from '@/components/list-item'
import { ListSheet } from '@/components/modal/list-sheet'

import { toggleInSet } from '@/utils/toggle-in-set'
import { buildOutline, findHeadings, getVisibleOutline } from '@/utils/headings'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'

import { HEADING_OUTLINE_CHEVRON_SIZE, HEADING_OUTLINE_INDENT } from '@/constants/headings'
import { SPACING } from '@/constants/theme'

const OutlineItem = memo(function OutlineItem({ item, collapsed, onPress, onToggle }) {
    const { colors } = useTheme()
    const handlePress = useCallback(() => onPress(item.index), [onPress, item.index])
    const handleToggle = useCallback(() => onToggle(item.index), [onToggle, item.index])

    return (
        <View style={{ marginLeft: item.depth * HEADING_OUTLINE_INDENT }}>
            <ListItem
                uppercase={false}
                title={item.text}
                background={colors.surfaceVariant}
                onPress={handlePress}
                rightContent={item.hasChildren ? (
                    <Pressable
                        hitSlop={SPACING.md}
                        onPress={handleToggle}
                        style={collapsed && styles.collapsed}
                    >
                        <KeyboardArrowDown
                            width={HEADING_OUTLINE_CHEVRON_SIZE}
                            height={HEADING_OUTLINE_CHEVRON_SIZE}
                            color={colors.onBackground}
                        />
                    </Pressable>
                ) : undefined}
            />
        </View>
    )
})

export const OutlineSheet = memo(function OutlineSheet({ sheet, contentRef, onSelect }) {
    const { t } = useTranslation()
    const [outline, setOutline] = useState([])
    const [collapsed, setCollapsed] = useState(() => new Set())

    const items = useMemo(() => getVisibleOutline(outline, collapsed), [outline, collapsed])

    sheet.beforeOpen.current = () => {
        setCollapsed(new Set())
        setOutline(buildOutline(findHeadings(contentRef.current.content || '')))
    }

    const onPress = useCallback((index) => {
        sheet.onClose()
        onSelect(index)
    }, [sheet, onSelect])

    const onToggle = useCallback((index) => setCollapsed((prev) => toggleInSet(prev, index)), [])

    const renderItem = useCallback(({ item }) => (
        <OutlineItem
            item={item}
            collapsed={collapsed.has(item.index)}
            onPress={onPress}
            onToggle={onToggle}
        />
    ), [collapsed, onPress, onToggle])

    return (
        <ListSheet
            sheet={sheet}
            data={items}
            renderItem={renderItem}
            keyExtractor={getOutlineKey}
            emptyMessage={t('message.outline.empty')}
        />
    )
})

const getOutlineKey = (item) => String(item.index)

const styles = StyleSheet.create({
    collapsed: {
        transform: [{ rotate: '-90deg' }]
    }
})
