import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useFolderSetting } from '@/hooks/use-folder-setting'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function DefaultNoteFolderOption() {
    const { t } = useTranslation()
    const folder = useFolderSetting(
        STORAGE_KEYS.DEFAULT_NOTE_FOLDER,
        t('settings.notes.default_folder.root')
    )

    return (
        <SelectOption
            title={t('settings.notes.default_folder.title')}
            description={folder.description}
            items={folder.items}
            selectedValue={folder.selectedValue}
            onSelect={folder.onSelect}
        />
    )
}
