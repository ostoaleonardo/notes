import { DrawerContentScrollView } from '@react-navigation/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerHeader } from './DrawerHeader'
import { DrawerScreen } from './DrawerScreen'
import { View } from 'react-native'

export function DrawerItems() {
    const { t } = useTranslation()

    return (
        <DrawerContentScrollView>
            <DrawerHeader />
            <View style={{ paddingVertical: 16 }}>
                <DrawerScreen
                    path='/home'
                    label={t('drawer.notes')}
                />
                <DrawerScreen
                    path='/categories'
                    label={t('drawer.categories')}
                />
                <DrawerScreen
                    path='/settings'
                    label={t('drawer.settings')}
                />
            </View>
        </DrawerContentScrollView>
    )
}
