import { StyleSheet } from 'react-native'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

export function Wrapper({ keyboard = true, children }) {
    const Wrapper = keyboard ? KeyboardAwareScrollView : NestableScrollContainer

    const wrapperProps = {
        'editor': {
            bottomOffset: 32,
            extraKeyboardSpace: 32,
            showsVerticalScrollIndicator: false
        },
        'list': {
            showsVerticalScrollIndicator: false,
            contentContainerStyle: styles.container
        }
    }

    return (
        <Wrapper {...wrapperProps[keyboard ? 'editor' : 'list']}>
            {children}
        </Wrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1
    }
})
