import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { useGroupPosition } from '@/hooks/use-group-position'
import { getSegmentCorners } from '@/utils/group-position'

import { BUTTON, SPLIT_TRIGGER_RADIUS } from '@/constants/components'
import { SPACING } from '@/constants/theme'

export function SplitButtonPrimary({ icon: Icon, label, onPress, testID }) {
    const { colors } = useTheme()
    const position = useGroupPosition()
    const { left, right } = getSegmentCorners(
        position,
        SPLIT_TRIGGER_RADIUS.outer,
        SPLIT_TRIGGER_RADIUS.inner
    )

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
            <TouchableRipple
                accessibilityRole='button'
                onPress={onPress}
                testID={testID}
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
