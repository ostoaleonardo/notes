import { router, useNavigation } from 'expo-router'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useIconProps } from '@/hooks'
import { ArrowBack, Menu } from '@/icons'
import { FONTS } from '@/constants'

export function AppBar({ title, trailing, mode = 'back' }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const navigation = useNavigation()
    const iconProps = useIconProps()

    const goBack = () => router.back()
    const openDrawer = () => navigation.dispatch({ type: 'OPEN_DRAWER' })

    return (
        <Appbar.Header style={{ backgroundColor: colors.background }}>
            {mode === 'back' && (
                <Tooltip title={t('button.back')}>
                    <Appbar.Action
                        animated={false}
                        onPress={goBack}
                        icon={() => <ArrowBack {...iconProps} />}
                        accessibilityLabel={t('button.back')}
                    />
                </Tooltip>
            )}

            {mode === 'menu' && (
                <Tooltip title={t('drawer.open')}>
                    <Appbar.Action
                        animated={false}
                        onPress={openDrawer}
                        icon={() => <Menu {...iconProps} />}
                        accessibilityLabel={t('drawer.open')}
                    />
                </Tooltip>
            )}

            <Appbar.Content
                title={title || ''}
                titleStyle={{ fontFamily: FONTS.nType82Headline }}
            />

            {trailing}
        </Appbar.Header>
    )
}
