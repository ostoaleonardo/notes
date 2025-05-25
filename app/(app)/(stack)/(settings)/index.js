import { Linking } from 'react-native'
import { router } from 'expo-router'
import { Switch, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Section, Separator, Scroll } from '@/components'
import { AppVersionCard, Languages, MarkdownTutorial, Option } from '@/screens'
import { useBottomSheet, useMarkdown } from '@/hooks'
import { ArrowForward, OpenInNew } from '@/icons'
import { LINKS, ROUTES } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { markdown, toggleMarkdown } = useMarkdown()

    const {
        ref: languagesBottomRef,
        onOpen: onOpenLanguages,
        onClose: onCloseLanguages
    } = useBottomSheet()

    const {
        ref: markdownBottomRef,
        onOpen: onOpenMarkdown,
        onClose: onCloseMarkdown
    } = useBottomSheet()

    const onToggleMarkdown = () => toggleMarkdown(!markdown)

    const iconProps = {
        color: colors.onBackground
    }

    return (
        <>
            <Scroll
                contentContainerStyle={{
                    gap: 24,
                    paddingBottom: 24
                }}
            >
                <Section>
                    <Option
                        title={t('settings.language')}
                        description={t('language')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={onOpenLanguages}
                    />
                    <Option
                        title={t('settings.theme')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={() => router.push(ROUTES.THEME)}
                    />
                </Section>

                <Separator style={{ marginHorizontal: 24 }} />

                <Section title='Markdown'>
                    <Option
                        title={t('settings.markdown.title')}
                        description={t('settings.markdown.description')}
                        rightContent={
                            <Switch
                                value={markdown}
                                onValueChange={onToggleMarkdown}
                            />
                        }
                    />
                    <Option
                        title={t('settings.markdown.tutorial')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={onOpenMarkdown}
                    />
                </Section>

                <Separator style={{ marginHorizontal: 24 }} />

                <Section title={t('title.about')}>
                    <Option
                        title={t('settings.github')}
                        description={t('settings.features')}
                        rightContent={<OpenInNew {...iconProps} />}
                        onPress={() => Linking.openURL(LINKS.GITHUB)}
                    />
                    <Option
                        title={t('settings.contribute')}
                        description={t('settings.translate')}
                        rightContent={<OpenInNew {...iconProps} />}
                        onPress={() => Linking.openURL(LINKS.TRANSLATIONS)}
                    />
                    <AppVersionCard />
                </Section>

                <Languages
                    ref={languagesBottomRef}
                    onClose={onCloseLanguages}
                />
                <MarkdownTutorial
                    ref={markdownBottomRef}
                    onClose={onCloseMarkdown}
                />
            </Scroll>
        </>
    )
}
