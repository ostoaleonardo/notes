import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '@/constants'

export function Chip({ label, onPress, variant, endContent }) {
    const styles = getChipStyles(variant, endContent !== undefined ? true : false)

    return (
        <Pressable
            onPress={onPress}
            style={styles.chipContainer}
        >
            <View style={styles.container}>
                <Text style={styles.chipText}>
                    {label}
                </Text>
                {endContent}
            </View>
        </Pressable>
    )
}

const getChipStyles = (variant, hasEndContent) => {
    let backgroundColor, borderColor
    const paddingLeft = hasEndContent ? 16 : 24
    const paddingRight = hasEndContent ? 8 : 24

    switch (variant) {
        case 'solid':
            backgroundColor = colors.primary
            borderColor = colors.primary
            break
        case 'bordered':
            backgroundColor = 'transparent'
            borderColor = colors.text15
            break
        default:
            backgroundColor = colors.primary
            borderColor = colors.primary
            break
    }

    return StyleSheet.create({
        chipContainer: {
            borderWidth: 2,
            borderRadius: 32,
            paddingVertical: 8,
            paddingLeft,
            paddingRight,
            borderColor,
            backgroundColor,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        container: {
            gap: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        chipText: {
            fontSize: 12,
            color: colors.text,
            fontWeight: 'bold',
            fontFamily: fonts.mono,
            textTransform: 'uppercase',
        },
    })
}
