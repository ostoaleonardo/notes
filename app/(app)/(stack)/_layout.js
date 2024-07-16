import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { FONTS } from '@/constants'

export default function StackLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: colors.onBackground,

                headerStyle: {
                    backgroundColor: colors.background
                },

                headerTitleStyle: {
                    fontSize: 12,
                    letterSpacing: 1,
                    fontFamily: FONTS.azeretLight
                },

                contentStyle: {
                    backgroundColor: colors.background
                }
            }}
        >
            <Stack.Screen
                name='(drawer)'
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name='(notes)'
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name='categories/index'
                options={{
                    title: t('header.categories').toUpperCase()
                }}
            />
            <Stack.Screen
                name='(settings)'
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    )
}
