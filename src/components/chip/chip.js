import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { AnimatedView } from '../animated'
import { Typography } from '../typography'

export function Chip({ mode = 'flat', onPress, closeIcon, children }) {
    const { colors } = useTheme()

    const modes = {
        flat: {
            color: colors.background,
            backgroundColor: colors.onBackground,
            borderColor: colors.onBackground
        },
        outlined: {
            color: colors.onBackground,
            backgroundColor: colors.transparent,
            borderColor: colors.outline
        }
    }

    const { color, backgroundColor, borderColor } = modes[mode]

    return (
        <AnimatedView>
            <Pressable
                onPress={onPress}
                style={{
                    ...styles.pressable,
                    paddingLeft: closeIcon ? 16 : 24,
                    paddingRight: closeIcon ? 8 : 24,
                    backgroundColor,
                    borderColor
                }}
            >
                <View style={styles.content}>
                    <Typography
                        bold
                        uppercase
                        color={color}
                        variant='caption'
                    >
                        {children}
                    </Typography>
                    {closeIcon}
                </View>
            </Pressable>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    pressable: {
        borderWidth: 1,
        borderRadius: 32,
        paddingVertical: 8
    },
    content: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
