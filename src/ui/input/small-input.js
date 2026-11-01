import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { FilledTextField } from '@/ui/input/filled-text-field'

export function SmallInput({ background, value, onChangeText, placeholder, autoFocus }) {
    const { colors } = useTheme()

    return (
        <View style={styles.container}>
            <FilledTextField
                multiline={false}
                value={value}
                autoFocus={autoFocus}
                placeholder={placeholder}
                containerColor={background || colors.surface}
                onChangeText={onChangeText}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    }
})
