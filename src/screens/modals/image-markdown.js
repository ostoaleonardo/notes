import { useState } from 'react'
import { Image } from 'expo-image'
import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { LargeInput, Pressable, Section } from '@/components'
import { useFileStorage, useIconProps, useRepositories } from '@/hooks'
import { Camera, Picture } from '@/icons'
import { openImagePicker } from '@/utils'
import { IMAGE_EXTENSION_BY_MIME_TYPE } from '@/constants'

export function ImageMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()
    const { copyImageFile } = useFileStorage()
    const { activeRepository, ensureImagesFolder } = useRepositories()
    const { colors } = useTheme()
    const iconProps = useIconProps()

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [isDeviceImage, setIsDeviceImage] = useState(false)

    const hasPreview = url.trim() !== ''

    const onPickImage = async (type) => {
        const asset = await openImagePicker(type)
        if (!asset) return

        const imagesUri = ensureImagesFolder(activeRepository)
        const extension = IMAGE_EXTENSION_BY_MIME_TYPE[asset.mimeType] || 'jpg'
        const file = await copyImageFile(asset.uri, imagesUri, `${randomUUID()}.${extension}`)

        setUrl(file.uri)
        setIsDeviceImage(true)
    }

    const onAdd = () => {
        if (!url.trim()) return

        onInsert({ title, url })

        setTitle('')
        setUrl('')
        setIsDeviceImage(false)
        onClose()
    }

    return (
        <View style={styles.container}>
            <Section
                title={t('markdown.image_url')}
                contentStyle={styles.field}
            >
                <LargeInput
                    value={url}
                    onChangeText={setUrl}
                    editable={!isDeviceImage}
                    placeholder='https://example.com/image.png'
                />
            </Section>

            {hasPreview && (
                <View style={styles.field}>
                    <View style={{ ...styles.preview, backgroundColor: colors.surfaceVariant }}>
                        <Image
                            source={url}
                            style={styles.image}
                            contentFit='cover'
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
                <Pressable
                    mode='text'
                    onPress={onClose}
                >
                    {t('button.cancel')}
                </Pressable>

                <View style={styles.pickerRow}>
                    <Tooltip title={t('markdown.image_camera')}>
                        <IconButton
                            mode='outlined'
                            onPress={() => onPickImage('camera')}
                            icon={() => <Camera {...iconProps} />}
                        />
                    </Tooltip>
                    <Tooltip title={t('markdown.image_gallery')}>
                        <IconButton
                            mode='outlined'
                            onPress={() => onPickImage('gallery')}
                            icon={() => <Picture {...iconProps} />}
                        />
                    </Tooltip>
                </View>

                <Pressable
                    mode='contained'
                    onPress={onAdd}
                >
                    {t('button.insert')}
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 24,
        paddingVertical: 24
    },
    field: {
        paddingHorizontal: 16
    },
    pickerRow: {
        flexDirection: 'row'
    },
    preview: {
        width: '100%',
        height: 180,
        borderRadius: 16,
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
        justifyContent: 'space-between',
        paddingHorizontal: 16
    }
})
