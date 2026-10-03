import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '../animated/animated-view'
import { Typography } from '../typography'

import { BUTTON_SIZE } from '@/constants/button'
import { SPACING } from '@/constants/spacing'

export function SplitButtonPrimary({ icon: Icon, label, onPress }) {
    const { colors } = useTheme()

    return (
        <AnimatedView
            style={{
                ...styles.primary,
                backgroundColor: colors.onBackground
            }}
        >
            <TouchableRipple
                onPress={onPress}
                style={styles.touchable}
            >
                <View style={styles.content}>
                    <Icon color={colors.background} />
                    {label && (
                        <Typography
                            bold={true}
                            color={colors.background}
                        >
                            {label}
                        </Typography>
                    )}
                </View>
            </TouchableRipple>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    primary: {
        height: BUTTON_SIZE,
        borderRadius: 4,
        borderTopLeftRadius: 22,
        borderBottomLeftRadius: 22,
        overflow: 'hidden'
    },
    touchable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg
    }
})
