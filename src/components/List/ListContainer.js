import { StyleSheet, TextInput } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Close, DragIndicator } from '@/icons'
import { FONTS } from '@/constants'

export function ListContainer({ item, onDrag, onChange, onDelete, isActive, children }) {
    const { colors } = useTheme()
    const { id, value } = item

    const { background, onBackground, tertiary, surface } = colors
    const iconProps = { color: onBackground + '66' }

    const animatedStyles = useAnimatedStyle(() => ({
        backgroundColor: withTiming(isActive ? surface : background)
    }))

    return (
        <Animated.View
            style={[
                styles.container,
                animatedStyles
            ]}
        >
            <IconButton
                onLongPress={onDrag}
                icon={() => <DragIndicator {...iconProps} />}
            />
            {children}
            <TextInput
                value={value}
                placeholder='...'
                cursorColor={onBackground}
                selectionHandleColor={tertiary}
                selectionColor={onBackground + '33'}
                placeholderTextColor={onBackground + '66'}
                onChangeText={(value) => onChange({ ...item, value })}
                style={{
                    ...styles.input,
                    color: onBackground
                }}
            />
            <IconButton
                onPress={() => onDelete(id)}
                icon={() => <Close {...iconProps} />}
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16
    },
    input: {
        flex: 1,
        fontFamily: FONTS.azeretLight
    }
})
