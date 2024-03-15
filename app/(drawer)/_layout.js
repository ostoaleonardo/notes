import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { useGlobalSearchParams } from 'expo-router'
import { DrawerItems } from '@/components'
import { colors, fonts } from '@/constants'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const params = useGlobalSearchParams()

    return (
        <Drawer
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: colors.text,

                headerStyle: {
                    backgroundColor: colors.background,
                },

                headerTitleStyle: {
                    fontSize: 12,
                    letterSpacing: 1,
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                },

                drawerStyle: {
                    backgroundColor: colors.background,
                },
            }}

            drawerContent={(props) => <DrawerItems {...props} />}
        >
            <Drawer.Screen
                name='(stack)'
                options={{
                    title: params.title ?? t('drawer.notes'),
                }}
            />
            <Drawer.Screen
                name='settings/index'
                options={{
                    title: t('drawer.settings'),
                }}
            />
            <Drawer.Screen
                name='categories/index'
                options={{
                    title: t('drawer.categories'),
                }}
            />
        </Drawer >
    )
}
