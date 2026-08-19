import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { FONTS } from '@/constants'

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
        fontSize: 12,
        fontFamily: FONTS.azeretLight
    }
})
