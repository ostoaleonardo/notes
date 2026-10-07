import { StyleSheet } from 'react-native'
import { Menu } from 'react-native-paper'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

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
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.caption,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
