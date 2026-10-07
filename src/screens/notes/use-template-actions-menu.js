import { useTranslation } from 'react-i18next'

import { useCommonActionsMenu } from './use-common-actions-menu'
import { ActionMenuItem } from '@/components/menu/action-menu-item'

import { Shapes } from '@/icons/shapes'

export const useTemplateActionsMenu = ({
    onTrigger,
    onSetMode,
    onOpenPlaceholders,
    onOpenVersionHistory,
    onOpenDeleteDialog
}) => {
    const { t } = useTranslation()
    const common = useCommonActionsMenu({
        onTrigger,
        onSetMode,
        onOpenVersionHistory,
        onOpenDeleteDialog
    })

    return [
        [
            common.code,
            <ActionMenuItem
                key='placeholders'
                title={t('templates.view_placeholders')}
                icon={Shapes}
                action={onOpenPlaceholders}
                onTrigger={onTrigger}
            />,
            common.versionHistory
        ],
        [common.remove]
    ]
}
