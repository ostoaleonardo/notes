import { router, useNavigation } from 'expo-router'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { ArrowBack } from '@/icons/arrow-back'
import { Menu } from '@/icons/menu'

import { FONTS } from '@/constants/theme'
import { ROUTES } from '@/constants/routes'
import { TEST_IDS } from '@/constants/test-ids'
import { DRAWER_ACTIONS } from '@/constants/drawer-views'
import { APP_BAR_MODES } from '@/constants/app-bar'

export function AppBar({ title, trailing, mode = APP_BAR_MODES.BACK }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const navigation = useNavigation()
    const goBack = () => (router.canGoBack() ? router.back() : router.replace(ROUTES.HOME))
    const openDrawer = () => navigation.dispatch({ type: DRAWER_ACTIONS.OPEN })

    return (
        <Appbar.Header style={{ backgroundColor: colors.background }}>
            {mode === APP_BAR_MODES.BACK && (
                <Tooltip title={t('button.back')}>
                    <Appbar.Action
                        animated={false}
                        onPress={goBack}
                        testID={TEST_IDS.APP_BAR_BACK}
                        icon={(props) => <ArrowBack {...props} />}
                        accessibilityLabel={t('button.back')}
                    />
                </Tooltip>
            )}

            {mode === APP_BAR_MODES.MENU && (
                <Tooltip title={t('drawer.open')}>
                    <Appbar.Action
                        animated={false}
                        onPress={openDrawer}
                        testID={TEST_IDS.APP_BAR_MENU}
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
