import { View } from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerScreen } from './DrawerScreen'
import { ROUTES } from '@/constants'

export function DrawerItems() {
    const { t } = useTranslation()

    return (
        <DrawerContentScrollView>
            <View style={{ paddingVertical: 16 }}>
                <DrawerScreen
                    path={ROUTES.HOME}
                    label={t('drawer.notes')}
                />
                <DrawerScreen
                    path={ROUTES.CATEGORIES}
                    label={t('drawer.categories')}
                />
            </View>
        </DrawerContentScrollView>
    )
}
