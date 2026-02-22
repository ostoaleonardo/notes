import { StyleSheet } from 'react-native'
import { Menu } from 'react-native-paper'
import { FONTS } from '@/constants'

export function MenuItem({ ...props }) {
    return (
        <Menu.Item
            titleStyle={styles.title}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
