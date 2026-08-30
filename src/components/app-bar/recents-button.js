import { Appbar, Tooltip } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useIconProps } from '@/hooks'
import { History } from '@/icons'

export function RecentsButton({ onPress }) {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const label = t('search.recent')

    return (
        <Tooltip title={label}>
            <Appbar.Action
                animated={false}
                onPress={onPress}
                icon={() => <History {...iconProps} />}
                accessibilityLabel={label}
            />
        </Tooltip>
    )
}
