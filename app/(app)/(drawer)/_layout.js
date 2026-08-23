import { View } from 'react-native'
import { Drawer } from 'expo-router/drawer'
import { useTheme } from 'react-native-paper'
import { DrawerItems, UnlockNoteGate } from '@/components'
import { getScreenContentStyle } from '@/utils'

export default function DrawerLayout() {
    const { colors } = useTheme()

    return (
        <View style={{ flex: 1 }}>
            <UnlockNoteGate />

            <Drawer
                screenOptions={{
                    headerShown: false,
                    drawerStyle: getScreenContentStyle(colors),
                    sceneStyle: getScreenContentStyle(colors)
                }}

                drawerContent={(props) => <DrawerItems {...props} />}
            >
                <Drawer.Screen name='(workspace)' />
                <Drawer.Screen name='(pages)' />
            </Drawer>
        </View>
    )
}
