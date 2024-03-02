import { Drawer } from 'expo-router/drawer'
import { useGlobalSearchParams } from 'expo-router'
import { colors, fonts } from '../../src/constants'

export default function DrawerLayout() {
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
                    title: params.title ?? 'Notes',
                }}
            />
            <Drawer.Screen
                name='settings/index'
                options={{
                    title: 'Settings',
                }}
            />
        </Drawer>
    )
}
