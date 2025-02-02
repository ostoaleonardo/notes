import { StyleSheet } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Menu, Settings } from '@/icons'
import { FONTS, ROUTES } from '@/constants'

export function AppBar({ options, navigation, showMenu, showSettings, showBack, rightContent }) {
    const { colors } = useTheme()
    const { t } = useTranslation()

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
            {showBack && (
                <Appbar.BackAction
                    animated={false}
                    onPress={goBack}
                />
            )}
            {showMenu && !showBack && (
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

            {rightContent}

            {showSettings && (
                <Tooltip title={t('header.settings')}>
                    <Appbar.Action
                        animated={false}
                        onPress={goSettings}
                        icon={() => <Settings {...iconProps} />}
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
