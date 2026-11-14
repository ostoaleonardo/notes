import { StyleSheet, View } from 'react-native'

import { AnimatedView } from '@/ui/animated/animated-view'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useSplitCorners } from '@/ui/hooks/use-split-corners'

import { BUTTON } from '@/ui/tokens/components'
import { SPACING } from '@/ui/tokens/theme'
import { Touchable } from '@/ui/touchable'

export const SplitButtonPrimary = ({
    icon: Icon,
    label,
    onPress,
    testID
}) => {
    const { colors } = useTheme()
    const { left, right } = useSplitCorners()

    return (
        <AnimatedView
            style={{
                ...styles.primary,
                borderTopLeftRadius: left,
                borderBottomLeftRadius: left,
                borderTopRightRadius: right,
                borderBottomRightRadius: right,
                backgroundColor: colors.onBackground
            }}
        >
            <Touchable
                accessibilityRole='button'
                onPress={onPress}
                testID={testID}
                style={styles.touchable}
            >
                <View style={styles.content}>
                    <Icon color={colors.background} />
                    {label && (
                        <Typography
                            color={colors.background}
                        >
                            {label}
                        </Typography>
                    )}
                </View>
            </Touchable>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    primary: {
        height: BUTTON.size,
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
