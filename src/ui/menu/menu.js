import { Children } from 'react'
import { StyleSheet, View } from 'react-native'
import { Box, DropdownMenuPopup, Spacer } from '@expo/ui/jetpack-compose'
import { height } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeContext, ComposeHost } from '@/ui/compose-context'
import { MenuGroupContext } from '@/ui/context/menu-group-context'

import { MENU_ALIGN } from '@/ui/tokens/components'
import { SPACING } from '@/ui/tokens/theme'

const gapModifiers = [height(SPACING.xxxs)]

export const Menu = ({
    anchor,
    visible,
    onClose,
    maxHeight,
    align = MENU_ALIGN.END,
    children
}) => {
    const groups = Children.toArray(children)

    return (
        <View style={[styles.container, align === MENU_ALIGN.START && styles.hug]}>
            {anchor}
            <ComposeHost style={[styles.popupAnchor, { [align]: 0 }]}>
                <Box>
                    <DropdownMenuPopup expanded={visible} onDismissRequest={onClose}>
                        <ComposeContext.Provider value>
                            {groups.map((group, index) => (
                                <MenuGroupContext.Provider
                                    key={group.key}
                                    value={{ index, count: groups.length, maxHeight }}
                                >
                                    {index > 0 && <Spacer modifiers={gapModifiers} />}
                                    {group}
                                </MenuGroupContext.Provider>
                            ))}
                        </ComposeContext.Provider>
                    </DropdownMenuPopup>
                </Box>
            </ComposeHost>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start'
    },
    hug: {
        alignSelf: 'flex-start'
    },
    popupAnchor: {
        position: 'absolute',
        bottom: 0
    }
})
