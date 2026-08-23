import { useTranslation } from 'react-i18next'
import { MenuItem } from '../menu/menu-item'
import { useIconProps } from '@/hooks'
import { Delete, Edit, Folder, Plus } from '@/icons'

export function DrawerRepositoryMenu({ isRoot, onCreateNote, onAddSubfolder, onEditFolder, onDelete }) {
    const { t } = useTranslation()
    const iconProps = useIconProps(16, 0.6)

    return (
        <>
            <MenuItem
                title={t('repositories.create_note')}
                leadingIcon={() => <Plus {...iconProps} />}
                onPress={onCreateNote}
            />
            <MenuItem
                title={t('repositories.add_subfolder')}
                leadingIcon={() => <Folder {...iconProps} />}
                onPress={onAddSubfolder}
            />
            {!isRoot && (
                <MenuItem
                    title={t('repositories.edit_folder')}
                    leadingIcon={() => <Edit {...iconProps} />}
                    onPress={onEditFolder}
                />
            )}
            {!isRoot && (
                <MenuItem
                    title={t('repositories.delete_folder')}
                    leadingIcon={() => <Delete {...iconProps} />}
                    onPress={onDelete}
                />
            )}
        </>
    )
}
