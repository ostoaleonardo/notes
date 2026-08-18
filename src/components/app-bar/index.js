import { StyleSheet } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useTrash } from '@/hooks'
import { ArrowBack, Delete, Menu } from '@/icons'
import { FONTS } from '@/constants'

export function AppBar({ options, navigation, menu, trash, back, right }) {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const { clearAll } = useTrash()

    const { title, mode = 'small' } = options
    const { background, onBackground } = colors

    const goBack = () => navigation.goBack()
    const openDrawer = () => navigation.openDrawer()

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
                    <Appbar.Action
                        isLeading
                        animated={false}
                        onPress={goBack}
                        icon={() => <ArrowBack {...iconProps} />}
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

            {trash && (
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
