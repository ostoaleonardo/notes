import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { FONTS } from '@/constants'

export function DialogButton(props) {
    return (
        <Button
            {...props}
            labelStyle={styles.label}
        />
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
