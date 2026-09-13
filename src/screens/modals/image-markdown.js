import { useState } from 'react'
import { Image } from 'expo-image'
import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { LargeInput } from '@/components/input/large-input'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'
import { Section } from '@/components/section'

import { useFileStorage } from '@/hooks/use-file-storage'
import { useRepositories } from '@/hooks/use-repositories'
import { openImagePicker } from '@/utils/image-picker'

import { Camera } from '@/icons/camera'
import { Picture } from '@/icons/picture'

import { COMMONS } from '@/constants/themes'
import { IMAGE_EXTENSION_BY_MIME_TYPE } from '@/constants/image'

export function ImageMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()
    const { copyImageFile } = useFileStorage()
    const { activeRepository, ensureImagesFolder } = useRepositories()
    const { colors } = useTheme()

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [isDeviceImage, setIsDeviceImage] = useState(false)
    const [imageSize, setImageSize] = useState(null)

    const hasPreview = url.trim() !== ''

    const onPickImage = async (type) => {
        const asset = await openImagePicker(type)
        if (!asset) return

        const imagesUri = ensureImagesFolder(activeRepository)
        const extension = IMAGE_EXTENSION_BY_MIME_TYPE[asset.mimeType] || 'jpg'
        const file = await copyImageFile(asset.uri, imagesUri, `${randomUUID()}.${extension}`)

        setUrl(file.uri)
        setIsDeviceImage(true)
        setImageSize(null)
    }

    const onAdd = () => {
        if (!url.trim()) return

        onInsert({ title, url })

        setTitle('')
        setUrl('')
        setIsDeviceImage(false)
        setImageSize(null)
        onClose()
    }

    return (
        <View style={styles.container}>
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
        gap: 24,
        paddingVertical: 24
    },
    field: {
        paddingHorizontal: 16
    },
    preview: {
        width: '100%',
        borderRadius: COMMONS.radius,
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
        paddingHorizontal: 16
    }
})
