import { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { LargeInput } from '@/components/input/large-input'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'
import { SHEET_FIELD_STYLE, SheetField, SheetForm } from '@/components/modal/sheet-form'
import { Typography } from '@/components/typography'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useFileStorage } from '@/hooks/use-file-storage'
import { useRepositories } from '@/hooks/use-repositories'
import { useStorage } from '@/hooks/use-storage'
import { readAttachmentSettings } from '@/utils/attachments'
import { getCameraPermission, openImagePicker, requestCameraPermission } from '@/utils/image-picker'

import { Camera } from '@/icons/camera'
import { Picture } from '@/icons/picture'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, SPACING, OPACITY, ICON_SIZE } from '@/constants/theme'
import { IMAGE_EXTENSION_BY_MIME_TYPE, IMAGE_SOURCES } from '@/constants/image'
import { PICKER_ERROR_CODES } from '@/constants/picker-errors'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { INPUT_EXAMPLES } from '@/constants/input-examples'
import { logError } from '@/utils/log-error'

export function ImageMarkdown({ onClose, onInsert, repositoryId }) {
    const { t } = useTranslation()
    const { copyImageFile } = useFileStorage()
    const { getItem } = useStorage()
    const { repositories, activeRepository, ensureAttachmentsFolder } = useRepositories()
    const { colors } = useTheme()

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [deviceImageName, setDeviceImageName] = useState('')
    const [imageSize, setImageSize] = useState(null)
    const [cameraPermission, setCameraPermission] = useState(null)

    const hasPreview = url.trim() !== ''
    const isDeviceImage = deviceImageName !== ''

    useEffect(() => {
        getCameraPermission().then(setCameraPermission)
    }, [])

    const onRequestCameraPermission = async () => {
        if (cameraPermission && !cameraPermission.canAskAgain) {
            Linking.openSettings()
            return
        }

        setCameraPermission(await requestCameraPermission())
    }

    const onPickImage = async (type) => {
        let asset = null

        try {
            asset = await openImagePicker(type)
        } catch (error) {
            if (error.code === PICKER_ERROR_CODES.PERMISSION_REJECTED) {
                setCameraPermission(await getCameraPermission())
                showSnackbar(t('markdown.camera_permission_denied'))
                return
            }

            logError(LOG_MESSAGES.ERROR_PICKING_IMAGE, error)
            showSnackbar(t('markdown.image_pick_failed'))
            return
        }

        if (!asset) return

        try {
            const repository = repositories.find((item) => item.id === repositoryId) || activeRepository
            const settings = await readAttachmentSettings(getItem)
            const attachmentsUri = ensureAttachmentsFolder(repository, settings)
            const extension = IMAGE_EXTENSION_BY_MIME_TYPE[asset.mimeType] || 'jpg'
            const file = await copyImageFile(asset.uri, attachmentsUri, `${randomUUID()}.${extension}`)

            setUrl(file.uri)
            setDeviceImageName(file.name)
            setImageSize(null)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_SAVING_PICKED_IMAGE, error)
            showSnackbar(t('markdown.image_save_failed'))
        }
    }

    const onAdd = () => {
        if (!url.trim()) return

        onInsert(isDeviceImage ? { embed: deviceImageName } : { title, url })

        setTitle('')
        setUrl('')
        setDeviceImageName('')
        setImageSize(null)
        onClose()
    }

    return (
        <SheetForm>
            {cameraPermission && !cameraPermission.granted && (
                <View
                    style={[
                        styles.permissionCard,
                        { backgroundColor: colors.tertiary + TRANSPARENT[10] }
                    ]}
                >
                    <TouchableRipple accessibilityRole='button' onPress={onRequestCameraPermission}>
                        <View style={styles.permissionContent}>
                            <View style={styles.permissionText}>
                                <Typography bold uppercase color={colors.tertiary} variant='caption'>
                                    {t('markdown.camera_permission_title')}
                                </Typography>
                                <Typography opacity={OPACITY.pressed} variant='caption' styleProps={styles.permissionMessage}>
                                    {t('markdown.camera_permission_message')}
                                </Typography>
                            </View>
                            <Camera color={colors.tertiary} width={ICON_SIZE.lg} height={ICON_SIZE.lg} />
                        </View>
                    </TouchableRipple>
                </View>
            )}

            {!isDeviceImage && (
                <SheetField title={t('markdown.image_url')}>
                    <LargeInput
                        value={url}
                        onChangeText={setUrl}
                        placeholder={INPUT_EXAMPLES.IMAGE_URL}
                    />
                </SheetField>
            )}

            {hasPreview && (
                <View style={SHEET_FIELD_STYLE}>
                    <View
                        style={{
                            ...styles.preview,
                            backgroundColor: colors.surfaceVariant,
                            aspectRatio: imageSize ? imageSize.width / imageSize.height : 1
                        }}
                    >
                        <Image
                            source={url}
                            style={styles.image}
                            contentFit='contain'
                            onLoad={(event) => setImageSize(event.source)}
                        />
                    </View>
                </View>
            )}

            <SheetField title={t('markdown.image_alt')}>
                <LargeInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('markdown.image_alt_placeholder')}
                />
            </SheetField>

            <View style={styles.buttons}>
                <IconToggleGroup
                    buttons={[
                        {
                            icon: Camera,
                            label: t('markdown.image_camera'),
                            onPress: () => onPickImage(IMAGE_SOURCES.CAMERA)
                        },
                        {
                            icon: Picture,
                            label: t('markdown.image_gallery'),
                            onPress: () => onPickImage(IMAGE_SOURCES.GALLERY)
                        },
                        {
                            showLabel: true,
                            label: t('button.insert'),
                            onPress: onAdd
                        }
                    ]}
                />
            </View>
        </SheetForm>
    )
}

const styles = StyleSheet.create({
    permissionCard: {
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
        overflow: 'hidden'
    },
    permissionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.md,
        padding: SPACING.lg
    },
    permissionText: {
        flex: 1
    },
    permissionMessage: {
        marginTop: SPACING.xxs
    },
    preview: {
        width: '100%',
        borderRadius: RADIUS.lg,
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%'
    },
    buttons: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg
    }
})
