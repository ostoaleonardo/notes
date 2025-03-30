import { Linking } from 'react-native'
import { router } from 'expo-router'
import { Switch, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Section, Separator, Scroll } from '@/components'
import { AppVersionCard, Languages, Option } from '@/screens'
import { useBottomSheet, useMarkdown } from '@/hooks'
import { ArrowForward, OpenInNew } from '@/icons'
import { LINKS, ROUTES } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { markdown, toggleMarkdown } = useMarkdown()
    const { ref, onOpen, onClose } = useBottomSheet()

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
                        onPress={onOpen}
                    />
                    <Option
                        title={t('settings.theme')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={() => router.push(ROUTES.THEME)}
                    />
                    <Option
                        title={t('settings.markdown')}
                        description={t('settings.mdOptions')}
                        rightContent={
                            <Switch
                                value={markdown}
                                onValueChange={onToggleMarkdown}
                            />
                        }
                    />
                </Section>

                <Separator style={{ marginHorizontal: 24 }} />

                <Section
                    title={t('title.about')}
                >
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
                    ref={ref}
                    onClose={onClose}
                />
            </Scroll>
        </>
    )
}
