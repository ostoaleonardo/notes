import { useTranslation } from 'react-i18next'

import { MenuItem } from '../menu/menu-item'

import { Delete } from '@/icons/delete'
import { Edit } from '@/icons/edit'
import { Folder } from '@/icons/folder'
import { Plus } from '@/icons/plus'

export function DrawerRepositoryMenu({ isRoot, onCreateNote, onAddSubfolder, onEditFolder, onDelete }) {
    const { t } = useTranslation()

    return (
        <>
            <MenuItem
                title={t('repositories.create_note')}
                leadingIcon={(props) => <Plus {...props} />}
                onPress={onCreateNote}
            />
            <MenuItem
                title={t('repositories.add_subfolder')}
                leadingIcon={(props) => <Folder {...props} />}
                onPress={onAddSubfolder}
            />
            {!isRoot && (
                <MenuItem
                    title={t('repositories.edit_folder')}
                    leadingIcon={(props) => <Edit {...props} />}
                    onPress={onEditFolder}
                />
            )}
            {!isRoot && (
                <MenuItem
                    title={t('repositories.delete_folder')}
                    leadingIcon={(props) => <Delete {...props} />}
                    onPress={onDelete}
                />
            )}
        </>
    )
}
