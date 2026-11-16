import { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ListItemAction } from '@/ui/button/list-item-action'
import { ListItem } from '@/ui/list-item'
import { ListSheet } from '@/ui/modal/list-sheet'
import { useTheme } from '@/ui/hooks/use-theme'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'

import { toggleInSet } from '@/utils/toggle-in-set'
import { buildOutline, findHeadings, getVisibleOutline } from '@/utils/headings'

import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'

import { HEADING_OUTLINE_CHEVRON_SIZE, HEADING_OUTLINE_INDENT } from '@/constants/headings'

const OutlineItem = memo(({
    item,
    collapsed,
    onPress,
    onToggle
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const toggleKey = collapsed ? 'message.outline.expand' : 'message.outline.collapse'
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
                    <ListItemAction
                        label={t(toggleKey)}
                        accessibilityState={{ expanded: !collapsed }}
                        onPress={handleToggle}
                        style={collapsed && styles.collapsed}
                    >
                        <KeyboardArrowDown
                            width={HEADING_OUTLINE_CHEVRON_SIZE}
                            height={HEADING_OUTLINE_CHEVRON_SIZE}
                            color={colors.onBackground}
                        />
                    </ListItemAction>
                ) : undefined}
            />
        </View>
    )
})

export const OutlineSheet = memo(({
    contentRef,
    onSelect,
    onClose
}) => {
    const { t } = useTranslation()
    const sheet = useBottomSheet()

    const [outline] = useState(() => buildOutline(findHeadings(contentRef.current.content || '')))
    const [collapsed, setCollapsed] = useState(() => new Set())

    const items = useMemo(() => getVisibleOutline(outline, collapsed), [outline, collapsed])

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
            presentOnMount
            onClose={onClose}
            title={t('title.outline')}
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
