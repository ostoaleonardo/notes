import { useTranslation } from 'react-i18next'

import { ListItemAction } from '@/ui/button/list-item-action'
import { useTheme } from '@/ui/hooks/use-theme'

import { Close } from '@/icons/close'

import { ICON_SIZE } from '@/constants/theme'

export const SearchRemoveAction = ({ onPress }) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <ListItemAction
            label={t('button.delete')}
            onPress={onPress}
        >
            <Close
                width={ICON_SIZE.lg}
                height={ICON_SIZE.lg}
                color={colors.onBackground}
            />
        </ListItemAction>
    )
}
