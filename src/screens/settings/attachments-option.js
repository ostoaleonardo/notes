import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { Option } from './option'
import { SelectOption } from './select-option'
import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'

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
import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SPACING } from '@/constants/theme'

const LOCATIONS = Object.values(ATTACHMENT_LOCATIONS)

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
        title: t(`settings.attachment_location_${value}`)
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
        <View style={styles.group}>
            <SelectOption
                title={t('settings.attachment_location')}
                description={t(`settings.attachment_location_${location}`)}
                items={locationItems}
                selectedValue={location}
                onSelect={onSelectLocation}
                isFirst={true}
                isLast={!showFolder}
            />

            {showFolder && (
                <Option
                    title={t('settings.attachment_folder')}
                    description={folderName}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={onOpenDialog}
                    isLast={true}
                />
            )}

            <DialogModal
                title={t('settings.attachment_folder')}
                visible={dialogVisible}
                onDismiss={() => setDialogVisible(false)}
                actions={(
                    <Button
                        mode='contained'
                        onPress={onSaveFolder}
                        labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                    >
                        {t('button.update')}
                    </Button>
                )}
            >
                <LargeInput
                    autoFocus
                    value={draft}
                    placeholder={DEFAULT_ATTACHMENT_FOLDER}
                    onChangeText={setDraft}
                />
            </DialogModal>
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: SPACING.xxs
    }
})
