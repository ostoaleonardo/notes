import { TextInput } from 'react-native'
import { Checkbox, IconButton, useTheme } from 'react-native-paper'
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { COLORS, FONTS } from '@/constants'

export function CheckBoxItem({ item, onChange, onDelete }) {
    const { id, value, checked } = item
    const { colors } = useTheme()

    return (
        <Animated.View
            entering={FadeInUp}
            exiting={FadeOutUp}
            layout={CurvedTransition}
            style={{
                gap: 4,
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            <Checkbox
                label={value}
                color={colors.onBackground}
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => onChange({ ...item, checked: !checked })}
            />
            <TextInput
                value={value}
                placeholder='...'
                placeholderTextColor={colors.onBackground + '66'}
                cursorColor={colors.tertiary}
                onChangeText={(value) => onChange({ ...item, value })}
                style={{
                    flex: 1,
                    color: colors.onBackground,
                    fontFamily: FONTS.azeretLight
                }}
            />
            <IconButton
                icon='close'
                iconColor={COLORS.common.white50}
                onPress={() => onDelete(id)}
            />
        </Animated.View>
    )
}
