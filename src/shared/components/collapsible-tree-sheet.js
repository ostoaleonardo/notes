import { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ListItemAction } from '@/ui/button/list-item-action'
import { ListItem } from '@/ui/list-item'
import { ListSheet } from '@/ui/modal/list-sheet'
import { useTheme } from '@/ui/hooks/use-theme'

import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'

import { toggleInSet } from '@/shared/utils/toggle-in-set'
import { getVisibleTree } from '@/shared/utils/collapsible-tree'

import { TREE_CHEVRON_SIZE, TREE_INDENT } from '@/shared/constants/tree-sheet'

const TreeItem = memo(({
    item,
    collapsed,
    testID,
    onSelect,
    onToggle
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const toggleKey = collapsed ? 'message.outline.expand' : 'message.outline.collapse'
    const handleSelect = useCallback(() => onSelect(item.key), [onSelect, item.key])
    const handleToggle = useCallback(() => onToggle(item.key), [onToggle, item.key])

    return (
        <View style={{ marginLeft: item.depth * TREE_INDENT }}>
            <ListItem
                uppercase={false}
                title={item.title}
                background={colors.surfaceVariant}
                testID={testID}
                emphasized={item.emphasized}
                leftContent={item.leftContent}
                onPress={item.disabled ? undefined : handleSelect}
                rightContent={(item.hasChildren || item.rightContent) ? (
                    <View style={styles.right}>
                        {item.rightContent}
                        {item.hasChildren && (
                            <ListItemAction
                                label={t(toggleKey)}
                                accessibilityState={{ expanded: !collapsed }}
                                onPress={handleToggle}
                                style={collapsed && styles.collapsed}
                            >
                                <KeyboardArrowDown
                                    width={TREE_CHEVRON_SIZE}
                                    height={TREE_CHEVRON_SIZE}
                                    color={colors.onBackground}
                                />
                            </ListItemAction>
                        )}
                    </View>
                ) : undefined}
            />
        </View>
    )
})

export const CollapsibleTreeSheet = memo(({
    sheet,
    title,
    items,
    itemTestID,
    emptyMessage,
    presentOnMount,
    onClose,
    onSelect
}) => {
    const [collapsed, setCollapsed] = useState(() => new Set())

    const visible = useMemo(() => getVisibleTree(items, collapsed, getItemKey), [items, collapsed])

    const onToggle = useCallback((key) => setCollapsed((prev) => toggleInSet(prev, key)), [])

    const renderItem = useCallback(({ item }) => (
        <TreeItem
            item={item}
            collapsed={collapsed.has(item.key)}
            testID={itemTestID}
            onSelect={onSelect}
            onToggle={onToggle}
        />
    ), [collapsed, itemTestID, onSelect, onToggle])

    return (
        <ListSheet
            sheet={sheet}
            title={title}
            data={visible}
            presentOnMount={presentOnMount}
            onClose={onClose}
            renderItem={renderItem}
            keyExtractor={getItemKey}
            emptyMessage={emptyMessage}
        />
    )
})

const getItemKey = (item) => String(item.key)

const styles = StyleSheet.create({
    right: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    collapsed: {
        transform: [{ rotate: '-90deg' }]
    }
})
