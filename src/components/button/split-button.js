import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { MenuContainer } from '../menu/menu-container'
import { SplitButtonPrimary } from './split-button-primary'
import { SplitButtonTrigger } from './split-button-trigger'

import { useAnimatedProgress } from '@/hooks/use-animated-progress'

export const SplitButton = ({
    icon,
    label,
    onPress,
    visible: controlledVisible,
    onOpen: controlledOnOpen,
    onClose: controlledOnClose,
    children
}) => {
    const [uncontrolledVisible, setUncontrolledVisible] = useState(false)
    const menuVisible = controlledVisible ?? uncontrolledVisible
    const openMenu = controlledOnOpen ?? (() => setUncontrolledVisible(true))
    const closeMenu = controlledOnClose ?? (() => setUncontrolledVisible(false))

    const openProgress = useAnimatedProgress(menuVisible)

    return (
        <View style={styles.container}>
            <SplitButtonPrimary
                icon={icon}
                label={label}
                onPress={onPress}
            />

            <MenuContainer
                grouped
                position='top'
                visible={menuVisible}
                onClose={closeMenu}
                anchor={
                    <SplitButtonTrigger
                        onPress={openMenu}
                        menuVisible={menuVisible}
                        openProgress={openProgress}
                    />
                }
            >
                {children}
            </MenuContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 2,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
