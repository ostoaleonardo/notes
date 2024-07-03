import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerItems } from '@/components'
import { HeaderRightContent } from '@/screens'
import { COLORS, FONTS } from '@/constants'

export default function DrawerLayout() {
    const { t } = useTranslation()

    return (
        <Drawer
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: COLORS.white,

                headerStyle: {
                    backgroundColor: COLORS.background
                },

                headerTitleStyle: {
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontFamily: FONTS.spaceMono
                },

                drawerStyle: {
                    backgroundColor: COLORS.foreground
                },

                sceneContainerStyle: {
                    backgroundColor: COLORS.background
                },

                headerRightContainerStyle: {
                    paddingRight: 16
                },

                headerRight: () => <HeaderRightContent />
            }}

            drawerContent={(props) => <DrawerItems {...props} />}
        >
            <Drawer.Screen
                name='home/index'
                options={{
                    title: t('drawer.notes')
                }}
            />
        </Drawer>
    )
}