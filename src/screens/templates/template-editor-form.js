import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { BasicTextField } from '@/ui/input/basic-text-field'
import { useHeadingFamily } from '@/ui/hooks/use-heading-family'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { Section } from '@/ui/section'
import { SPACING, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'
import { TINT } from '@/ui/tokens/transparent'

export const TemplateEditorForm = ({
    name,
    setName,
    content,
    setContent,
    action,
    mode,
    onFocus,
    onBlur,
    onHistoryChange,
    searchQuery,
    replaceText
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const fontFamily = useHeadingFamily()

    const titleStyle = useMemo(() => ({
        color: colors.onBackground,
        fontFamily,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.headlineSmall
    }), [colors.onBackground, fontFamily])
    const titleSelection = useMemo(() => ({
        handleColor: colors.accentText,
        backgroundColor: colors.onBackground + TINT.fill
    }), [colors.accentText, colors.onBackground])
    const search = useMemo(() => ({ query: searchQuery, replace: replaceText }), [searchQuery, replaceText])

    return (
        <>
            <Section containerStyle={{ paddingHorizontal: SPACING.lg }}>
                <BasicTextField
                    value={name}
                    textStyle={titleStyle}
                    cursorColor={colors.onBackground}
                    selectionColors={titleSelection}
                    placeholderColor={colors.onBackground + TINT.placeholder}
                    placeholder={t('placeholder.title')}
                    onChangeText={setName}
                />
            </Section>

            <Section
                containerStyle={{ flex: 1 }}
                contentStyle={{ flex: 1 }}
            >
                <MarkdownInput
                    value={content}
                    onChangeText={setContent}
                    action={action}
                    mode={mode}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onHistoryChange={onHistoryChange}
                    search={search}
                    placeholder={t('placeholder.note')}
                />
            </Section>
        </>
    )
}
