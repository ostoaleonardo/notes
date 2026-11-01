import { router, useNavigation } from 'expo-router'
import { Appbar, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@/ui/button/icon-button'

import { useHeadingFont } from '@/hooks/use-heading-font'

import { ArrowBack } from '@/icons/arrow-back'
import { Menu } from '@/icons/menu'

import { ROUTES } from '@/constants/routes'
import { TEST_IDS } from '@/constants/test-ids'
import { DRAWER_ACTIONS } from '@/constants/drawer-views'
import { APP_BAR_MODES } from '@/constants/app-bar'

export function AppBar({ title, trailing, mode = APP_BAR_MODES.BACK }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { fontFamily } = useHeadingFont()

    const navigation = useNavigation()
    const goBack = () => (router.canGoBack() ? router.back() : router.replace(ROUTES.HOME))
    const openDrawer = () => navigation.dispatch({ type: DRAWER_ACTIONS.OPEN })

    return (
        <Appbar.Header style={{ backgroundColor: colors.background }}>
            {mode === APP_BAR_MODES.BACK && (
                <IconButton
                    icon={ArrowBack}
                    label={t('button.back')}
                    testID={TEST_IDS.APP_BAR_BACK}
                    onPress={goBack}
                />
            )}

            {mode === APP_BAR_MODES.MENU && (
                <IconButton
                    icon={Menu}
                    label={t('drawer.open')}
                    testID={TEST_IDS.APP_BAR_MENU}
                    onPress={openDrawer}
                />
            )}

            <Appbar.Content
                title={title || ''}
                titleStyle={{ fontFamily }}
            />

            {trailing}
        </Appbar.Header>
    )
}
