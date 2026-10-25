import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function Button({ children, ...props }) {
    return (
        <PaperButton
            uppercase
            mode='contained'
            labelStyle={styles.label}
            {...props}
        >
            {children}
        </PaperButton>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall,
        fontFamily: FONTS.azeretLight
    }
})
