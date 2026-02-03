import { StyleSheet } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useTrash } from '@/hooks'
import { Delete, Menu, Settings } from '@/icons'
import { FONTS, ROUTES } from '@/constants'

export function AppBar({ options, navigation, menu, settings, back, right }) {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const { clearAll } = useTrash()

    const { title, mode = 'small' } = options
    const { background, onBackground } = colors

    const goBack = () => navigation.goBack()
    const openDrawer = () => navigation.openDrawer()
    const goSettings = () => navigation.navigate(ROUTES.SETTINGS)

    const iconProps = {
        width: 24,
        height: 24,
        color: onBackground
    }

    return (
        <Appbar.Header
            mode={mode}
            style={{
                ...styles.header,
                backgroundColor: background
            }}
        >
            {back && (
                <Tooltip title={t('button.back')}>
                    <Appbar.BackAction
                        animated={false}
                        onPress={goBack}
                    />
                </Tooltip>
            )}
            {menu && !back && (
                <Appbar.Action
                    animated={false}
                    onPress={openDrawer}
                    icon={() => <Menu {...iconProps} />}
                />
            )}

            <Appbar.Content
                title={t(title)}
                titleStyle={styles.title}
            />

            {right}

            {settings && (
                <Tooltip title={t('title.settings')}>
                    <Appbar.Action
                        animated={false}
                        onPress={goSettings}
                        icon={() => <Settings {...iconProps} />}
                    />
                </Tooltip>
            )}

            {title === t('header.trash') && (
                <Tooltip title={t('header.trash')}>
                    <Appbar.Action
                        animated={false}
                        onPress={clearAll}
                        icon={() => <Delete {...iconProps} />}
                    />
                </Tooltip>
            )}
        </Appbar.Header>
    )
}

const styles = StyleSheet.create({
    header: {
        justifyContent: 'space-between'
    },
    title: {
        fontFamily: FONTS.nType82Headline
    }
})
