import { forwardRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LargeInput, ModalSheet, Pressable, Section } from '@/components'

export const LinkModal = forwardRef(({ onClose, onInsert }, ref) => {
    const { t } = useTranslation()

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')

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
                title={t('markdown.link_title')}
                contentStyle={styles.field}
            >
                <LargeInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder='YouTube'
                />
            </Section>
            <Section
                title={t('markdown.link_url')}
                contentStyle={styles.field}
            >
                <LargeInput
                    value={url}
                    onChangeText={setUrl}
                    placeholder='www.youtube.com'
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
    buttons: {
        width: '100%',
        gap: 8,
        paddingHorizontal: 16
    }
})
