import { router, useNavigation } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { AppBarHeader } from '@/ui/app-bar-header'
import { IconButton } from '@/ui/button/icon-button'

import { ICON_BUTTON } from '@/ui/tokens/components'

import { ArrowBack } from '@/icons/arrow-back'
import { Menu } from '@/icons/menu'

import { ROUTES } from '@/constants/routes'
import { TEST_IDS } from '@/constants/test-ids'
import { DRAWER_ACTIONS } from '@/constants/drawer-views'
import { APP_BAR_MODES } from '@/constants/app-bar'

export const AppBar = ({
    title,
    trailing,
    mode = APP_BAR_MODES.BACK
}) => {
    const { t } = useTranslation()

    const navigation = useNavigation()
    const goBack = () => (router.canGoBack() ? router.back() : router.replace(ROUTES.HOME))
    const openDrawer = () => navigation.dispatch({ type: DRAWER_ACTIONS.OPEN })

    const leading = mode === APP_BAR_MODES.BACK ? (
        <IconButton
            appearance={ICON_BUTTON.appBar}
            icon={ArrowBack}
            label={t('button.back')}
            testID={TEST_IDS.APP_BAR_BACK}
            onPress={goBack}
        />
    ) : (
        <IconButton
            appearance={ICON_BUTTON.appBar}
            icon={Menu}
            label={t('drawer.open')}
            testID={TEST_IDS.APP_BAR_MENU}
            onPress={openDrawer}
        />
    )

    return (
        <AppBarHeader
            title={title}
            leading={leading}
            trailing={trailing}
        />
    )
}
