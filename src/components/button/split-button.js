import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { MenuContainer } from '@/components/menu/menu-container'
import { SplitButtonPrimary } from './split-button-primary'
import { SplitButtonTrigger } from './split-button-trigger'

import { BUTTON } from '@/constants/components'
import { useAnimatedProgress } from '@/hooks/use-animated-progress'

export const SplitButton = ({
    icon,
    label,
    onPress,
    visible: controlledVisible,
    onOpen: controlledOnOpen,
    onClose: controlledOnClose,
    primaryTestID,
    triggerTestID,
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
                testID={primaryTestID}
            />

            <MenuContainer
                grouped
                position='top'
                visible={menuVisible}
                onClose={closeMenu}
                anchor={
                    <SplitButtonTrigger
                        onPress={openMenu}
                        testID={triggerTestID}
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
        gap: BUTTON.groupGap,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
