import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import { AppBar, DrawerItems } from '@/components'
import { SortAction } from '@/screens'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Drawer
            screenOptions={{
                header: (props) => (
                    <AppBar
                        showMenu
                        showSettings
                        rightContent={<SortAction />}
                        {...props}
                    />
                ),

                drawerStyle: {
                    backgroundColor: colors.surface
                },

                sceneStyle: {
                    backgroundColor: colors.background
                }
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