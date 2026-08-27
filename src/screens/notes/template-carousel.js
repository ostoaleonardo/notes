import { useEffect, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Scroll, Typography } from '@/components'
import { useLanguage, useRepositories, useTemplates } from '@/hooks'
import { getPreviewNote, renderTemplate } from '@/utils'
import { COMMONS, TEMPLATE_PREVIEW_MAX_CHARS, TEMPLATE_PREVIEW_MAX_LINES, TRANSPARENT } from '@/constants'

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
                    style={{
                        ...styles.card,
                        backgroundColor: colors.surface,
                        borderColor: colors.onSurface + TRANSPARENT[10]
                    }}
                >
                    <Typography
                        bold={true}
                        opacity={0.6}
                        fontSize={10}
                        numberOfLines={1}
                        uppercase={true}
                    >
                        {t(`templates.${template.name}`, template.name)}
                    </Typography>

                    <Typography
                        opacity={0.6}
                        fontSize={11}
                        numberOfLines={TEMPLATE_PREVIEW_MAX_LINES}
                    >
                        {getPreviewNote(
                            renderTemplate(template.content, { title, language: currentLanguage }),
                            TEMPLATE_PREVIEW_MAX_LINES,
                            TEMPLATE_PREVIEW_MAX_CHARS
                        )}
                    </Typography>
                </Pressable>
            ))}
        </Scroll>
    )
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        gap: 8,
        paddingHorizontal: 16,
        alignItems: 'flex-start'
    },
    card: {
        width: 256,
        gap: 6,
        padding: 12,
        borderWidth: 1,
        borderRadius: COMMONS.radius
    }
})
