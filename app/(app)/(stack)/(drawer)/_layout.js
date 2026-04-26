import { Drawer } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import { AppBar, DrawerItems } from '@/components'
import { SortAction, SyncAction } from '@/screens'
import { usePremium } from '@/hooks'

export default function DrawerLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { premium } = usePremium()

    return (
        <Drawer
            screenOptions={{
                header: (props) => (
                    <AppBar
                        menu={true}
                        settings={true}
                        right={
                            <>
                                <SyncAction />
                                <SortAction />
                            </>
                        }
                        {...props}
                    />
                ),

                drawerStyle: {
                    backgroundColor: colors.background
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
                    title: t('title.notes') + (premium ? ' (Pro)' : '')
                }}
            />
        </Drawer>
    )
}