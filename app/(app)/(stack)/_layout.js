import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { AppBar } from '@/components'
import { getScreenContentStyle } from '@/utils'

export default function StackLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                header: (props) => (
                    <AppBar
                        props={props}
                        leading='back'
                    />
                ),

                contentStyle: getScreenContentStyle(colors)
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
                name='tags/index'
                options={{
                    title: t('title.tags')
                }}
            />
            <Stack.Screen
                name='trash/index'
                options={{
                    title: t('title.trash')
                }}
            />
            <Stack.Screen
                name='repositories/index'
                options={{
                    title: t('title.repositories')
                }}
            />
            <Stack.Screen
                name='templates/index'
                options={{
                    title: t('title.templates')
                }}
            />
            <Stack.Screen
                name='templates/edit/[filename]'
                options={{
                    title: t('title.templates')
                }}
            />
            <Stack.Screen
                name='settings/index'
                options={{
                    title: t('title.settings')
                }}
            />
            <Stack.Screen
                name='image-viewer'
                options={{
                    headerShown: false,
                    presentation: 'transparentModal',
                    animation: 'fade'
                }}
            />
        </Stack>
    )
}
