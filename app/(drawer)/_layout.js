import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { useGlobalSearchParams } from 'expo-router'
import { DrawerItems } from '@/components'
import { HeaderAvatar } from '@/screens'
import { COLORS, FONTS } from '@/constants'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const params = useGlobalSearchParams()

    return (
        <Drawer
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: COLORS.text,

                headerStyle: {
                    backgroundColor: COLORS.background,
                },

                headerTitleStyle: {
                    fontSize: 12,
                    letterSpacing: 1,
                    fontFamily: FONTS.mono,
                    textTransform: 'uppercase',
                },

                drawerStyle: {
                    backgroundColor: COLORS.background,
                },

                sceneContainerStyle: {
                    backgroundColor: COLORS.background,
                },
            }}

            drawerContent={(props) => <DrawerItems {...props} />}
        >
            <Drawer.Screen
                name='(stack)'
                options={{
                    title: params.title ?? t('drawer.notes'),
                    headerRight: () => <HeaderAvatar />,
                    headerRightContainerStyle: {
                        paddingRight: 16,
                    },
                }}
            />
            <Drawer.Screen
                name='categories/index'
                options={{
                    title: t('header.categories'),
                    headerRight: () => <HeaderAvatar />,
                    headerRightContainerStyle: {
                        paddingRight: 16,
                    },
                }}
            />
            <Drawer.Screen
                name='settings/index'
                options={{
                    title: t('header.settings'),
                }}
            />
        </Drawer>
    )
}
