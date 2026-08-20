import { StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router'
import { ActivityIndicator, useTheme } from 'react-native-paper'
import { useImportMarkdown } from '@/hooks'

export default function AppLayout() {
    const { colors } = useTheme()
    const { importing } = useImportMarkdown()

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,

                    contentStyle: {
                        backgroundColor: colors.background
                    }
                }}
            >
                <Stack.Screen name='(stack)' />
            </Stack>

            {importing && (
                <View style={[styles.overlay, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size='large' />
                </View>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
