import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, SPACING, FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function SmallInput({ background, ...props }) {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: background || colors.surface
            }}
        >
            <TextInput
                style={{
                    ...styles.base,
                    color: colors.onBackground
                }}
                cursorColor={colors.onBackground}
                selectionHandleColor={colors.tertiary}
                selectionColor={colors.onBackground + TRANSPARENT[20]}
                placeholderTextColor={colors.onBackground + TRANSPARENT[40]}
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg
    },
    base: {
        flex: 1,
        padding: 0,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.paragraph,
        textAlignVertical: 'center',
        fontFamily: FONTS.azeretLight
    }
})
