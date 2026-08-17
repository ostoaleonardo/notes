import { forwardRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import { LargeInput, ModalSheet, Pressable, Section } from '@/components'

export const ImageModal = forwardRef(({ onClose, onInsert }, ref) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')

    const hasPreview = url.trim() !== ''

    const onAdd = () => {
        if (!url.trim()) return

        onInsert({ title, url })

        setTitle('')
        setUrl('')
        onClose()
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            contentContainerStyle={styles.container}
        >
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

            {hasPreview && (
                <View style={styles.field}>
                    <View style={[styles.preview, { backgroundColor: colors.surfaceVariant }]}>
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
                    mode='contained'
                    onPress={onAdd}
                >
                    {t('button.insert')}
                </Pressable>
                <Pressable
                    mode='outlined'
                    onPress={onClose}
                >
                    {t('button.cancel')}
                </Pressable>
            </View>
        </ModalSheet>
    )
})

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
        gap: 8,
        paddingHorizontal: 16
    }
})
