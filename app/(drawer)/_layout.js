import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { useGlobalSearchParams } from 'expo-router'
import { colors, fonts } from '../../src/constants'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const params = useGlobalSearchParams()

    return (
        <Drawer
            screenOptions={{
                headerTitleAlign: 'center',
                headerTintColor: colors.text,

                headerStyle: {
                    backgroundColor: colors.background,
                },

                headerTitleStyle: {
                    fontSize: 16,
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                },

                drawerStyle: {
                    backgroundColor: colors.background,
                },

                drawerItemStyle: {
                    borderRadius: 16,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                },

                drawerLabelStyle: {
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                },

                drawerActiveBackgroundColor: colors.primary15,
                drawerActiveTintColor: colors.primary,

                drawerInactiveTintColor: colors.text,
            }}
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
        </Drawer>
    )
}
