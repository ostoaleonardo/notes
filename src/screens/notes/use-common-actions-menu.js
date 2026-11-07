import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionMenuItem } from '@/ui/menu/action-menu-item'

import { Code } from '@/icons/code'
import { Commit } from '@/icons/commit'
import { Delete } from '@/icons/delete'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { getMenuItemTestId } from '@/ui/utils/test-ids'

export const useCommonActionsMenu = ({
    onTrigger,
    onSetMode,
    onOpenVersionHistory,
    onOpenDeleteDialog
}) => {
    const { t } = useTranslation()

    const onOpenCode = useCallback(() => onSetMode(EDITOR_MODES.CODE), [onSetMode])

    return {
        code: (
            <ActionMenuItem
                key='code'
                testID={getMenuItemTestId('code')}
                title={t('button.code')}
                icon={Code}
                action={onOpenCode}
                onTrigger={onTrigger}
            />
        ),
        versionHistory: (
            <ActionMenuItem
                key='version-history'
                testID={getMenuItemTestId('version-history')}
                title={t('title.version_history')}
                icon={Commit}
                action={onOpenVersionHistory}
                onTrigger={onTrigger}
            />
        ),
        remove: (
            <ActionMenuItem
                key='delete'
                testID={getMenuItemTestId('delete')}
                title={t('button.delete')}
                icon={Delete}
                action={onOpenDeleteDialog}
                onTrigger={onTrigger}
            />
        )
    }
}
