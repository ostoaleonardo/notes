import { StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

export function Wrapper({ keyboard = true, children }) {
    return (
        <KeyboardAwareScrollView
            bottomOffset={32}
            extraKeyboardSpace={32}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {children}
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1
    }
})
