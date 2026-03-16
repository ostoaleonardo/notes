import { View } from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerScreen } from './drawer-screen'
import { SignInHeader } from './sign-in-header'
import { ROUTES } from '@/constants'
import { useCategories, useNotes, useTrash } from '@/hooks'

export function DrawerItems() {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { trash } = useTrash()
    const { categories } = useCategories()

    return (
        <DrawerContentScrollView>
            <View style={{ paddingVertical: 16 }}>
                <SignInHeader />
                <DrawerScreen
                    path={ROUTES.HOME}
                    label={t('drawer.notes')}
                    indicator={notes?.length || '0'}
                />
                <DrawerScreen
                    path={ROUTES.CATEGORIES}
                    label={t('drawer.categories')}
                    indicator={categories?.length - 1 || '0'}
                />
                <DrawerScreen
                    path={ROUTES.TRASH}
                    label={t('drawer.trash')}
                    indicator={trash?.size || '0'}
                />
            </View>
        </DrawerContentScrollView>
    )
}
