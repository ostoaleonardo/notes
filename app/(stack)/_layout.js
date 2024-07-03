import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { COLORS, FONTS } from '@/constants'

export default function StackLayout() {
    const { t } = useTranslation()

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerTintColor: COLORS.white,

                headerStyle: {
                    backgroundColor: COLORS.background
                },

                headerTitleStyle: {
                    fontSize: 12,
                    letterSpacing: 1,
                    fontFamily: FONTS.azeretLight
                },

                contentStyle: {
                    backgroundColor: COLORS.background
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
                name='profile/index'
                options={{
                    title: t('header.profile').toUpperCase()
                }}
            />
            <Stack.Screen
                name='settings/index'
                options={{
                    title: t('header.settings').toUpperCase()
                }}
            />
        </Stack>
    )
}
