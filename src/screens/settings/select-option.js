import { FlatList, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { ListItem } from '../../components/list-item'
import { Menu } from '@/components/menu/menu'
import { MenuGroup } from '@/components/menu/menu-group'
import { SelectMenuItem } from '@/components/menu/select-menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'

import { ArrowForward } from '@/icons/arrow-forward'

import { MENU } from '@/constants/components'

export function SelectOption({
    title,
    description,
    items,
    selectedValue,
    onSelect
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
                <ListItem
                    title={title}
                    description={description}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={menu.onPressRow}
                />
            </View>

            <Menu
                visible={menu.visible}
                onClose={menu.onClose}
                anchor={menu.anchor}
            >
                <MenuGroup>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={getItemKey}
                        style={styles.menuList}
                        extraData={selectedValue}
                    />
                </MenuGroup>
            </Menu>
        </View>
    )
}

const getItemKey = (item) => item.value

const styles = StyleSheet.create({
    menuList: {
        maxHeight: MENU.maxHeight
    }
})
