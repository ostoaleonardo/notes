import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { GridView, ViewAgenda } from '@/icons'
import { useUtils } from '@/hooks'

export function ViewAction() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { view, updateView } = useUtils()

    const onToggleView = () => {
        updateView(view === 'list' ? 'grid' : 'list')
    }

    const title = view === 'list' ? t('view.grid') : t('view.list')
    const Icon = view === 'list' ? GridView : ViewAgenda

    return (
        <Tooltip title={title}>
            <Appbar.Action
                animated={false}
                icon={() => <Icon color={colors.onSurface} />}
                onPress={onToggleView}
            />
        </Tooltip>
    )
}
