import { Stack } from 'expo-router'
import { useTheme, Appbar, Tooltip } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { AppBar } from '@/components'
import { useIconProps } from '@/hooks'
import { Code, Delete } from '@/icons'

export default function StackLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const iconProps = useIconProps()

    return (
        <Stack
            screenOptions={{
                header: (props) => {
                    const trash = props.route.name === 'trash/index'
                    const isEditTemplate = props.route.name === 'templates/edit/[filename]'
                    const { onDelete, onOpenPlaceholders } = props.options

                    return (
                        <AppBar
                            trash={trash}
                            right={isEditTemplate && (
                                <>
                                    {onOpenPlaceholders && (
                                        <Tooltip title={t('templates.view_placeholders')}>
                                            <Appbar.Action
                                                animated={false}
                                                onPress={onOpenPlaceholders}
                                                icon={() => <Code {...iconProps} />}
                                            />
                                        </Tooltip>
                                    )}
                                    {onDelete && (
                                        <Tooltip title={t('button.delete')}>
                                            <Appbar.Action
                                                animated={false}
                                                onPress={onDelete}
                                                icon={() => <Delete {...iconProps} />}
                                            />
                                        </Tooltip>
                                    )}
                                </>
                            )}
                            {...props}
                            back={true}
                        />
                    )
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
        </Stack>
    )
}
