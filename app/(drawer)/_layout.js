import { Drawer } from 'expo-router/drawer'
import { colors, fonts } from '../../src/constants'

export default function DrawerLayout() {
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

                drawerActiveBackgroundColor: `${colors.primary}20`,
                drawerActiveTintColor: colors.primary,

                drawerInactiveTintColor: colors.text,
            }}
        >
            <Drawer.Screen
                name='(stack)'
                options={{
                    title: 'Notes',
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
