import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { Option } from './option'
import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'
import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { sanitizeFolderName } from '@/utils/attachments'

import { ArrowForward } from '@/icons/arrow-forward'
import { Check } from '@/icons/check'

import {
    ATTACHMENT_FOLDER_LOCATIONS,
    ATTACHMENT_LOCATIONS,
    DEFAULT_ATTACHMENT_FOLDER,
    DEFAULT_ATTACHMENT_LOCATION
} from '@/constants/attachments'
import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TRANSPARENT } from '@/constants/themes'
import { SPACING } from '@/constants/spacing'

const OPTIONS = Object.values(ATTACHMENT_LOCATIONS)

export function AttachmentsOption() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const locationMenu = useMenuAnchor()

    const [location, setLocation] = useState(DEFAULT_ATTACHMENT_LOCATION)
    const [folderName, setFolderName] = useState(DEFAULT_ATTACHMENT_FOLDER)
    const [draft, setDraft] = useState('')
    const [dialogVisible, setDialogVisible] = useState(false)

    useStorageEffect(STORAGE_KEYS.ATTACHMENT_LOCATION, (value) => {
        if (OPTIONS.includes(value)) setLocation(value)
    })
    useStorageEffect(STORAGE_KEYS.ATTACHMENT_FOLDER, (value) => {
        if (value) setFolderName(sanitizeFolderName(value))
    })

    const showFolder = ATTACHMENT_FOLDER_LOCATIONS.includes(location)

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
            <View ref={locationMenu.rowRef} collapsable={false}>
                <Option
                    title={t('settings.attachment_location')}
                    description={t(`settings.attachment_location_${location}`)}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={locationMenu.onPressRow}
                    isFirst={true}
                    isLast={!showFolder}
                />
            </View>

            {showFolder && (
                <Option
                    title={t('settings.attachment_folder')}
                    description={folderName}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={onOpenDialog}
                    isLast={true}
                />
            )}

            <MenuContainer
                visible={locationMenu.visible}
                onClose={locationMenu.onClose}
                anchor={locationMenu.anchor}
            >
                {OPTIONS.map((value) => {
                    const selected = value === location

                    return (
                        <MenuItem
                            key={value}
                            contentStyle={styles.item}
                            title={t(`settings.attachment_location_${value}`)}
                            trailingIcon={selected ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                            style={selected && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                            onPress={() => locationMenu.trigger(() => onSelectLocation(value))}
                        />
                    )
                })}
            </MenuContainer>

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
        gap: 3
    },
    item: {
        flexGrow: 1,
        marginRight: SPACING.md
    }
})
