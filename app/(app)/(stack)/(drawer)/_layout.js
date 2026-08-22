import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import { AppBar, DrawerItems } from '@/components'
import { HomeAction } from '@/screens/app-bar-actions'
import { usePremium } from '@/hooks'
import { getScreenContentStyle } from '@/utils'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { premium } = usePremium()

    return (
        <Drawer
            screenOptions={{
                header: (props) => (
                    <AppBar
                        leading='menu'
                        props={props}
                        trailing={<HomeAction />}
                    />
                ),

                drawerStyle: getScreenContentStyle(colors),
                sceneStyle: getScreenContentStyle(colors)
            }}

            drawerContent={(props) => <DrawerItems {...props} />}
        >
            <Drawer.Screen
                name='home/index'
                options={{
                    title: t('title.notes') + (premium ? ' (Pro)' : '')
                }}
            />
        </Drawer>
    )
}