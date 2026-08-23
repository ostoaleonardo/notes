import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { SmallInput } from './small-input'
import { Search } from '@/icons'
import { COMMONS } from '@/constants'

export function SearchInput({
    value,
    onChangeText,
    placeholder,
    ...props
}) {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: colors.surface
            }}
        >
            <SmallInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                {...props}
            />

            <IconButton
                disabled={true}
                pointerEvents='none'
                icon={(props) => <Search {...props} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 16,
        flexDirection: 'row',
        borderRadius: COMMONS.radius
    }
})
