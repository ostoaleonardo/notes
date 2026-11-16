import { useTranslation } from 'react-i18next'

import { useCommonActionsMenu } from './use-common-actions-menu'
import { ActionMenuItem } from '@/ui/menu/action-menu-item'

import { Shapes } from '@/icons/shapes'
import { getMenuItemTestId } from '@/ui/utils/test-ids'

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
                testID={getMenuItemTestId('placeholders')}
                title={t('templates.placeholders.view')}
                icon={Shapes}
                action={onOpenPlaceholders}
                onTrigger={onTrigger}
            />,
            common.versionHistory
        ],
        [common.remove]
    ]
}
