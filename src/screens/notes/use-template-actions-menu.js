import { useTranslation } from 'react-i18next'

import { MenuItem } from '@/components/menu/menu-item'

import { Code } from '@/icons/code'
import { Commit } from '@/icons/commit'
import { Delete } from '@/icons/delete'
import { Shapes } from '@/icons/shapes'

export const useTemplateActionsMenu = ({ onTrigger, onSetMode, onOpenPlaceholders, onOpenVersionHistory, onOpenDeleteDialog }) => {
    const { t } = useTranslation()

    return [
        [
            <MenuItem
                key='code'
                title={t('button.code')}
                leadingIcon={(props) => <Code {...props} />}
                onPress={() => onTrigger(() => onSetMode('code'))}
            />,
            <MenuItem
                key='placeholders'
                title={t('templates.view_placeholders')}
                leadingIcon={(props) => <Shapes {...props} />}
                onPress={() => onTrigger(onOpenPlaceholders)}
            />,
            <MenuItem
                key='version-history'
                title={t('title.version_history')}
                leadingIcon={(props) => <Commit {...props} />}
                onPress={() => onTrigger(onOpenVersionHistory)}
            />
        ],
        [
            <MenuItem
                key='delete'
                title={t('button.delete')}
                leadingIcon={(props) => <Delete {...props} />}
                onPress={() => onTrigger(onOpenDeleteDialog)}
            />
        ]
    ]
}
