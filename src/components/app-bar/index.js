import { StyleSheet } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useIconProps } from '@/hooks'
import { ArrowBack, Menu } from '@/icons'
import { FONTS } from '@/constants'

export function AppBar({ props, leading, trailing }) {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const iconProps = useIconProps()

    const { navigation, options } = props
    const { title, mode = 'small' } = options

    const goBack = () => navigation.goBack()
    const openDrawer = () => navigation.openDrawer()

    return (
        <Appbar.Header
            mode={mode}
            style={{
                ...styles.header,
                backgroundColor: colors.background
            }}
        >
            {leading === 'back' && (
                <Tooltip title={t('button.back')}>
                    <Appbar.Action
                        isLeading
                        animated={false}
                        onPress={goBack}
                        icon={() => <ArrowBack {...iconProps} />}
                    />
                </Tooltip>
            )}

            {leading === 'menu' && (
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

            {trailing ?? options.trailing}
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
