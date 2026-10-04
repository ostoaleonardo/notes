import { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { LargeInput } from '@/components/input/large-input'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'
import { Section } from '@/components/section'
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
import { RADIUS } from '@/constants/radius'
import { IMAGE_EXTENSION_BY_MIME_TYPE } from '@/constants/image'
import { SPACING } from '@/constants/spacing'
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
            if (error.code === 'ERR_USER_REJECTED_PERMISSIONS') {
                setCameraPermission(await getCameraPermission())
                showSnackbar(t('markdown.camera_permission_denied'))
                return
            }

            logError('error', error)
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
            logError('error saving picked image', error)
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
        <View style={styles.container}>
            {cameraPermission && !cameraPermission.granted && (
                <View
                    style={[
                        styles.permissionCard,
                        { backgroundColor: colors.tertiary + TRANSPARENT[10] }
                    ]}
                >
                    <TouchableRipple onPress={onRequestCameraPermission}>
                        <View style={styles.permissionContent}>
                            <View style={styles.permissionText}>
                                <Typography bold uppercase color={colors.tertiary} variant='caption'>
                                    {t('markdown.camera_permission_title')}
                                </Typography>
                                <Typography opacity={0.7} variant='caption' styleProps={styles.permissionMessage}>
                                    {t('markdown.camera_permission_message')}
                                </Typography>
                            </View>
                            <Camera color={colors.tertiary} width={20} height={20} />
                        </View>
                    </TouchableRipple>
                </View>
            )}

            {!isDeviceImage && (
                <Section
                    title={t('markdown.image_url')}
                    contentStyle={styles.field}
                >
                    <LargeInput
                        value={url}
                        onChangeText={setUrl}
                        placeholder='https://example.com/image.png'
                    />
                </Section>
            )}

            {hasPreview && (
                <View style={styles.field}>
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

            <Section
                title={t('markdown.image_alt')}
                contentStyle={styles.field}
            >
                <LargeInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('markdown.image_alt_placeholder')}
                />
            </Section>

            <View style={styles.buttons}>
                <IconToggleGroup
                    buttons={[
                        {
                            icon: Camera,
                            label: t('markdown.image_camera'),
                            onPress: () => onPickImage('camera')
                        },
                        {
                            icon: Picture,
                            label: t('markdown.image_gallery'),
                            onPress: () => onPickImage('gallery')
                        },
                        {
                            showLabel: true,
                            label: t('button.insert'),
                            onPress: onAdd
                        }
                    ]}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.xxl,
        paddingVertical: SPACING.xxl
    },
    field: {
        paddingHorizontal: SPACING.lg
    },
    permissionCard: {
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.outer,
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
        borderRadius: RADIUS.outer,
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
