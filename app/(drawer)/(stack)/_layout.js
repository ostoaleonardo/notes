import { Stack } from 'expo-router'

export default function StackLayout() {
    return (
        <Stack
            screenOptions={{
                animation: 'ios',
                headerShown: false,
            }}
        />
    )
}