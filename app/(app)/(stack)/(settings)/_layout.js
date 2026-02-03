import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { AppBar } from '@/components'

export default function StackLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                header: (props) => <AppBar showBack {...props} />,

                contentStyle: {
                    backgroundColor: colors.background
                }
            }}
        >
            <Stack.Screen
                name='index'
                options={{
                    title: t('title.settings')
                }}
            />
            <Stack.Screen
                name='theme'
                options={{
                    title: t('title.theme')
                }}
            />
        </Stack>
    )
}
