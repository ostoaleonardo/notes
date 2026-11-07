import { View } from 'react-native'

import { ListItem } from '../../ui/list-item'
import { Menu } from '@/ui/menu/menu'
import { MenuGroup } from '@/ui/menu/menu-group'
import { SelectMenuItem } from '@/ui/menu/select-menu-item'
import { useTheme } from '@/ui/hooks/use-theme'

import { useMenuAction } from '@/hooks/use-menu-action'

import { ArrowForward } from '@/icons/arrow-forward'

import { SIZE } from '@/constants/theme'
import { getMenuItemTestId } from '@/ui/utils/test-ids'

export const SelectOption = ({
    title,
    description,
    items,
    selectedValue,
    testID,
    onSelect
}) => {
    const { colors } = useTheme()
    const menu = useMenuAction()
    const maxHeight = items.length * SIZE.lg > SIZE.xxxxxl ? SIZE.xxxxxl : undefined

    return (
        <View>
            <ListItem
                title={title}
                description={description}
                rightContent={<ArrowForward color={colors.onBackground} />}
                onPress={menu.onOpen}
                testID={testID}
            />

            <Menu visible={menu.visible} onClose={menu.onClose} maxHeight={maxHeight}>
                <MenuGroup>
                    {items.map((item) => (
                        <SelectMenuItem
                            key={item.value}
                            testID={getMenuItemTestId(item.value)}
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
