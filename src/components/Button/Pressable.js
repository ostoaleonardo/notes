import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { FONTS } from '@/constants'

export function Pressable({ children, ...props }) {
    return (
        <Button
            uppercase
            mode='contained'
            style={styles.base}
            labelStyle={styles.label}
            contentStyle={styles.content}
            {...props}
        >
            {children}
        </Button>
    )
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 48
    },
    content: {
        paddingVertical: 6
    },
    label: {
        fontSize: 12,
        fontFamily: FONTS.azeretLight
    }
})
