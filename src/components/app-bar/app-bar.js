import { router, useNavigation } from 'expo-router'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { ArrowBack } from '@/icons/arrow-back'
import { Menu } from '@/icons/menu'

import { FONTS } from '@/constants/fonts'
import { ROUTES } from '@/constants/routes'

export function AppBar({ title, trailing, mode = 'back' }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const navigation = useNavigation()
    const goBack = () => (router.canGoBack() ? router.back() : router.replace(ROUTES.HOME))
    const openDrawer = () => navigation.dispatch({ type: 'OPEN_DRAWER' })

    return (
        <Appbar.Header style={{ backgroundColor: colors.background }}>
            {mode === 'back' && (
                <Tooltip title={t('button.back')}>
                    <Appbar.Action
                        animated={false}
                        onPress={goBack}
                        icon={(props) => <ArrowBack {...props} />}
                        accessibilityLabel={t('button.back')}
                    />
                </Tooltip>
            )}

            {mode === 'menu' && (
                <Tooltip title={t('drawer.open')}>
                    <Appbar.Action
                        animated={false}
                        onPress={openDrawer}
                        icon={(props) => <Menu {...props} />}
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
