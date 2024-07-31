import { TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { IconButton } from '../Button'
import { Typography } from '../Text'
import { Cross, DragIndicator } from '@/icons'
import { FONTS } from '@/constants'

export function NumberedListItem({ index, item, onDrag, onChange, onDelete, isActive }) {
    const { id, value } = item
    const { colors } = useTheme()

    const iconProps = { color: colors.onBackground + '66' }

    const animatedStyles = useAnimatedStyle(() => ({
        backgroundColor: withTiming(isActive ? colors.surface : colors.background)
    }))

    return (
        <Animated.View
            style={[
                animatedStyles, {
                    height: 48,
                    gap: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16
                }
            ]}
        >
            <IconButton
                variant='light'
                onLongPress={onDrag}
                icon={<DragIndicator {...iconProps} />}
            />
            <Typography
                bold
            >
                {index + 1 + '. '}
            </Typography>
            <TextInput
                value={value}
                placeholder='...'
                cursorColor={colors.onBackground}
                selectionHandleColor={colors.tertiary}
                selectionColor={colors.onBackground + '33'}
                placeholderTextColor={colors.onBackground + '66'}
                onChangeText={(value) => onChange({ ...item, value })}
                style={{
                    flex: 1,
                    color: colors.onBackground,
                    fontFamily: FONTS.azeretLight
                }}
            />
            <IconButton
                variant='light'
                onPress={() => onDelete(id)}
                icon={
                    <Cross
                        width={24}
                        height={24}
                        rotation={45}
                        {...iconProps}
                    />
                }
            />
        </Animated.View>
    )
}
