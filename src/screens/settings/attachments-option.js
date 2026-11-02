import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '../../ui/list-item'
import { SelectOption } from './select-option'
import { StorageSelectOption } from './storage-select-option'
import { Dialog } from '@/ui/dialog'
import { FilledButton } from '@/ui/button/filled-button'
import { PositionGroup } from '@/ui/position-group'
import { FilledTextField } from '@/ui/input/filled-text-field'
import { useTheme } from '@/ui/hooks/use-theme'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { sanitizeFolderName } from '@/utils/attachments'

import { ArrowForward } from '@/icons/arrow-forward'

import {
    ATTACHMENT_FOLDER_LOCATIONS,
    ATTACHMENT_LOCATIONS,
    DEFAULT_ATTACHMENT_FOLDER,
    DEFAULT_ATTACHMENT_LOCATION
} from '@/constants/attachments'
import { PDF_EMBED_MODES, DEFAULT_PDF_EMBED_MODE } from '@/constants/pdf-embed'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const LOCATIONS = Object.values(ATTACHMENT_LOCATIONS)
const PDF_EMBED_VALUES = Object.values(PDF_EMBED_MODES)

export function AttachmentsOption() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()

    const [location, setLocation] = useState(DEFAULT_ATTACHMENT_LOCATION)
    const [folderName, setFolderName] = useState(DEFAULT_ATTACHMENT_FOLDER)
    const [draft, setDraft] = useState('')
    const [dialogVisible, setDialogVisible] = useState(false)

    useStorageEffect(STORAGE_KEYS.ATTACHMENT_LOCATION, (value) => {
        if (LOCATIONS.includes(value)) setLocation(value)
    })
    useStorageEffect(STORAGE_KEYS.ATTACHMENT_FOLDER, (value) => {
        if (value) setFolderName(sanitizeFolderName(value))
    })

    const showFolder = ATTACHMENT_FOLDER_LOCATIONS.includes(location)

    const locationItems = useMemo(() => LOCATIONS.map((value) => ({
        value,
        title: t(`settings.attachments.location.${value}`)
    })), [t])

    const onSelectLocation = (value) => {
        setLocation(value)
        setItem(STORAGE_KEYS.ATTACHMENT_LOCATION, value)
    }

    const onOpenDialog = () => {
        setDraft(folderName)
        setDialogVisible(true)
    }

    const onSaveFolder = () => {
        const next = sanitizeFolderName(draft)
        setFolderName(next)
        setItem(STORAGE_KEYS.ATTACHMENT_FOLDER, next)
        setDialogVisible(false)
    }

    return (
        <>
            <PositionGroup>
                <SelectOption
                    title={t('settings.attachments.location.title')}
                    description={t(`settings.attachments.location.${location}`)}
                    items={locationItems}
                    selectedValue={location}
                    onSelect={onSelectLocation}
                />

                {showFolder && (
                    <ListItem
                        title={t('settings.attachments.folder')}
                        description={folderName}
                        rightContent={<ArrowForward color={colors.onBackground} />}
                        onPress={onOpenDialog}
                    />
                )}

                <StorageSelectOption
                    storageKey={STORAGE_KEYS.PDF_EMBED}
                    translationKey='settings.attachments.pdf_embed'
                    values={PDF_EMBED_VALUES}
                    defaultValue={DEFAULT_PDF_EMBED_MODE}
                />
            </PositionGroup>

            <Dialog
                title={t('settings.attachments.folder')}
                visible={dialogVisible}
                onDismiss={() => setDialogVisible(false)}
                confirm={(
                    <FilledButton onPress={onSaveFolder}>
                        {t('button.update')}
                    </FilledButton>
                )}
            >
                <FilledTextField
                    autoFocus
                    multiline={false}
                    value={draft}
                    placeholder={DEFAULT_ATTACHMENT_FOLDER}
                    onChangeText={setDraft}
                />
            </Dialog>
        </>
    )
}
