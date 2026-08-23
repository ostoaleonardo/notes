import { View } from 'react-native'
import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { TabBar } from '@/components'
import { getScreenContentStyle } from '@/utils'

export default function WorkspaceLayout() {
    const { colors } = useTheme()

    return (
        <View style={{ flex: 1 }}>
            <TabBar />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: getScreenContentStyle(colors)
                }}
            >
                <Stack.Screen name='home/index' />
                <Stack.Screen name='(notes)' />
                <Stack.Screen name='templates/[filename]' />
                <Stack.Screen
                    name='image-viewer'
                    options={{
                        presentation: 'transparentModal',
                        animation: 'fade'
                    }}
                />
            </Stack>
        </View>
    )
}
