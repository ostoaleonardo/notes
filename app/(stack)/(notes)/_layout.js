import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { COLORS, FONTS } from '@/constants'

export default function NotesLayout() {
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
                name='index'
                options={{
                    title: t('header.addNote').toUpperCase()
                }}
            />
            <Stack.Screen
                name='view/[slug]'
                options={{
                    title: t('header.viewNote').toUpperCase()
                }}
            />
            <Stack.Screen
                name='edit/[slug]'
                options={{
                    title: t('header.editNote').toUpperCase()
                }}
            />
            <Stack.Screen
                name='unlock/[slug]'
                options={{
                    title: t('header.password').toUpperCase()
                }}
            />
        </Stack>
    )
}
