import { StyleSheet } from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerHeader } from './DrawerHeader'
import { DrawerScreen } from './DrawerScreen'
import { Pencil, Settings, Shapes } from '@/icons'
import { COLORS } from '@/constants'

export function DrawerItems() {
    const { t } = useTranslation()

    return (
        <DrawerContentScrollView style={styles.container}>
            <DrawerHeader />
            <DrawerScreen
                path='/home'
                icon={Pencil}
                label={t('drawer.notes')}
            />
            <DrawerScreen
                path='/categories'
                icon={Shapes}
                label={t('drawer.categories')}
            />
            <DrawerScreen
                path='/settings'
                icon={Settings}
                label={t('drawer.settings')}
            />
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
})
