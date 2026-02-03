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
                header: (props) => <AppBar back={true} {...props} />,

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
                    title: t('title.categories')
                }}
            />
            <Stack.Screen
                name='trash/index'
                options={{
                    title: t('title.trash')
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
