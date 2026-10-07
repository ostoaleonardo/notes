import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function Pressable({ children, ...props }) {
    return (
        <Button
            uppercase
            mode='contained'
            labelStyle={styles.label}
            {...props}
        >
            {children}
        </Button>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.caption,
        fontFamily: FONTS.azeretLight
    }
})
