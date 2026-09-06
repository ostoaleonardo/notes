import { Drawer } from 'expo-router/drawer'
import { useTheme } from 'react-native-paper'

import { DrawerItems } from '@/components/drawer/drawer-items'

import { getScreenContentStyle } from '@/utils/screen-content-style'

export default function DrawerLayout() {
    const { colors } = useTheme()

    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerStyle: getScreenContentStyle(colors),
                sceneStyle: getScreenContentStyle(colors)
            }}

            drawerContent={(props) => <DrawerItems {...props} />}
        >
            <Drawer.Screen name='(workspace)' />
        </Drawer>
    )
}
