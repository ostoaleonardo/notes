import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MarkdownInput, Scroll, Typography } from '@/components'
import { useLanguage, useRepositories, useTemplates } from '@/hooks'
import { getPreviewNote, renderTemplate } from '@/utils'
import { COMMONS } from '@/constants'

export function TemplateCarousel({ title, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { activeRepository } = useRepositories()
    const { currentLanguage } = useLanguage()
    const { listTemplates } = useTemplates()

    const [templates, setTemplates] = useState([])

    useEffect(() => {
        let cancelled = false

        listTemplates().then((loaded) => {
            if (!cancelled) setTemplates(loaded)
        })

        return () => { cancelled = true }
    }, [activeRepository?.id])

    if (templates.length === 0) return null

    const onPress = (template) => {
        onSelect(renderTemplate(template.content, { title, language: currentLanguage }))
    }

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            contentContainerStyle={styles.content}
        >
            {templates.map((template) => (
                <Pressable
                    key={template.filename}
                    onPress={() => onPress(template)}
                    style={[styles.card, { backgroundColor: colors.surface }]}
                >
                    <Typography
                        bold
                        variant='caption'
                        numberOfLines={1}
                    >
                        {t(`templates.${template.name}`, template.name)}
                    </Typography>

                    <View
                        pointerEvents='none'
                        style={styles.preview}
                    >
                        <MarkdownInput
                            size={9}
                            value={getPreviewNote(template.content)}
                        />
                    </View>
                </Pressable>
            ))}
        </Scroll>
    )
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        gap: 8,
        paddingHorizontal: 16
    },
    card: {
        width: 140,
        height: 120,
        padding: 12,
        gap: 6,
        borderRadius: COMMONS.radius
    },
    preview: {
        flex: 1,
        overflow: 'hidden'
    }
})
