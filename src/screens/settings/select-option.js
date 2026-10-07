import { FlatList, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Option } from './option'
import { MenuContainer } from '@/components/menu/menu-container'
import { SelectMenuItem } from '@/components/menu/select-menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'

import { ArrowForward } from '@/icons/arrow-forward'

import { MENU } from '@/constants/components'

export function SelectOption({
    title,
    description,
    items,
    selectedValue,
    onSelect,
    isFirst,
    isLast
}) {
    const { colors } = useTheme()
    const menu = useMenuAnchor()

    const renderItem = ({ item }) => (
        <SelectMenuItem
            title={item.title}
            contentStyle={item.contentStyle}
            selected={item.value === selectedValue}
            onPress={() => menu.trigger(() => onSelect(item.value))}
        />
    )

    return (
        <View>
            <View ref={menu.rowRef} collapsable={false}>
                <Option
                    title={title}
                    description={description}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={menu.onPressRow}
                    isFirst={isFirst}
                    isLast={isLast}
                />
            </View>

            <MenuContainer
                visible={menu.visible}
                onClose={menu.onClose}
                anchor={menu.anchor}
            >
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={getItemKey}
                    style={styles.menuList}
                    extraData={selectedValue}
                />
            </MenuContainer>
        </View>
    )
}

const getItemKey = (item) => item.value

const styles = StyleSheet.create({
    menuList: {
        maxHeight: MENU.maxHeight
    }
})
