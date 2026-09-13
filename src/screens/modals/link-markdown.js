import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { LargeInput } from '@/components/input/large-input'
import { Pressable } from '@/components/button/pressable'
import { Section } from '@/components/section'

export function LinkMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

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
        <View style={styles.container}>
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
                    buttonColor={colors.surfaceVariant}
                    textColor={colors.onBackground}
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
    buttons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
