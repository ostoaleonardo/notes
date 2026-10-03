import { useTranslation } from 'react-i18next'

import { MenuItem } from '../menu/menu-item'

import { Delete } from '@/icons/delete'
import { Edit } from '@/icons/edit'
import { Folder } from '@/icons/folder'
import { Plus } from '@/icons/plus'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'

const MENU_ITEMS = [
    { action: REPOSITORY_ACTIONS.CREATE_NOTE, label: 'repositories.create_note', icon: Plus },
    { action: REPOSITORY_ACTIONS.ADD_SUBFOLDER, label: 'repositories.add_subfolder', icon: Folder },
    { action: REPOSITORY_ACTIONS.EDIT_FOLDER, label: 'repositories.edit_folder', icon: Edit },
    { action: REPOSITORY_ACTIONS.DELETE, label: 'repositories.delete_folder', icon: Delete }
]

export function DrawerRepositoryMenu({ actions, createLabelKey, onAction }) {
    const { t } = useTranslation()

    return MENU_ITEMS
        .filter((item) => actions.includes(item.action))
        .map(({ action, label, icon: Icon }) => (
            <MenuItem
                key={action}
                title={t(action === REPOSITORY_ACTIONS.CREATE_NOTE ? createLabelKey || label : label)}
                leadingIcon={(props) => <Icon {...props} />}
                onPress={() => onAction(action)}
            />
        ))
}
