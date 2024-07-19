import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { FONTS } from '@/constants'

export default function NotesLayout() {
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
                    title: t('header.unlock').toUpperCase()
                }}
            />
        </Stack>
    )
}
