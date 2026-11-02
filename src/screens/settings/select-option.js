import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { ListItem } from '../../ui/list-item'
import { Menu } from '@/ui/menu/menu'
import { MenuGroup } from '@/ui/menu/menu-group'
import { SelectMenuItem } from '@/ui/menu/select-menu-item'

import { useMenuAction } from '@/hooks/use-menu-action'

import { ArrowForward } from '@/icons/arrow-forward'

export function SelectOption({
    title,
    description,
    items,
    selectedValue,
    onSelect
}) {
    const { colors } = useTheme()
    const menu = useMenuAction()

    return (
        <View>
            <ListItem
                title={title}
                description={description}
                rightContent={<ArrowForward color={colors.onBackground} />}
                onPress={menu.onOpen}
            />

            <Menu visible={menu.visible} onClose={menu.onClose}>
                <MenuGroup>
                    {items.map((item) => (
                        <SelectMenuItem
                            key={item.value}
                            title={item.title}
                            indent={item.indent}
                            selected={item.value === selectedValue}
                            onPress={() => menu.trigger(() => onSelect(item.value))}
                        />
                    ))}
                </MenuGroup>
            </Menu>
        </View>
    )
}
