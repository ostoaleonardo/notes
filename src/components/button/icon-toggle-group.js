import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { IconToggle } from './icon-toggle'

import { BUTTON } from '@/constants/components'

export function IconToggleGroup({ buttons, background }) {
    const { colors } = useTheme()

    return (
        <View style={styles.group}>
            {buttons.map((button, index) => (
                <IconToggle
                    key={button.label}
                    position={index === 0 ? 'first' : index === buttons.length - 1 ? 'last' : 'middle'}
                    background={background ?? colors.surfaceVariant}
                    color={colors.onBackground}
                    {...button}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: BUTTON.groupGap,
        flexDirection: 'row'
    }
})
