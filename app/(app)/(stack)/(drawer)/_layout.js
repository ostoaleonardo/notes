import { Drawer } from 'expo-router/drawer'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DrawerItems } from '@/components'
import { HeaderRightContent } from '@/screens'
import { FONTS } from '@/constants'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Drawer
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: colors.onBackground,

                headerStyle: {
                    backgroundColor: colors.background
                },

                headerTitleStyle: {
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontFamily: FONTS.spaceMono
                },

                drawerStyle: {
                    backgroundColor: colors.surface
                },

                sceneContainerStyle: {
                    backgroundColor: colors.background
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
                    title: t('header.notes')
                }}
            />
        </Drawer>
    )
}