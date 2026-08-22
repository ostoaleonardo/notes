import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { MarkdownPreview, Typography } from '@/components'
import { useLanguage } from '@/hooks'
import { renderTemplate } from '@/utils'
import { COMMONS, TRANSPARENT } from '@/constants'

export function TemplateItem({ template, onPress }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { currentLanguage } = useLanguage()

    return (
        <Pressable
            onPress={onPress}
            style={{
                ...styles.container,
                backgroundColor: colors.surface,
                borderColor: colors.onSurface + TRANSPARENT[10]
            }}
        >
            <Typography
                bold
                uppercase
                opacity={0.6}
                fontSize={10}
                numberOfLines={1}
            >
                {t(`templates.${template.name}`, template.name)}
            </Typography>

            <MarkdownPreview
                size={11}
                value={renderTemplate(template.content, { language: currentLanguage })}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        gap: 10,
        borderRadius: COMMONS.radius,
        borderWidth: 1
    }
})
