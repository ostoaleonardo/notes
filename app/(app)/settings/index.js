import { isDevice } from 'expo-device'
import { Linking, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { LanguageOption } from '@/screens/settings/language-option'
import { ProSection } from '@/screens/settings/pro-section'
import { HeadingFontOption } from '@/screens/settings/heading-font-option'
import { ThemeOption } from '@/screens/settings/theme-option'
import { AppVersionCard } from '@/screens/settings/app-version-card'
import { Option } from '@/screens/settings/option'
import { WikiLinksOption } from '@/screens/settings/wiki-links-option'
import { AttachmentsOption } from '@/screens/settings/attachments-option'
import { SelectOptionList } from '@/screens/settings/select-option-list'
import { DailyNoteOption } from '@/screens/settings/daily-note-option'
import { DefaultNoteFolderOption } from '@/screens/settings/default-note-folder-option'
import { Scroll } from '@/components/animated/scroll'
import { Section } from '@/components/section'

import { OpenInNew } from '@/icons/open-in-new'

import { LINKS } from '@/constants/links'
import { SPACING } from '@/constants/theme'
import { EDITOR_SELECT_OPTIONS, NOTES_SELECT_OPTIONS } from '@/constants/settings-select-options'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <View style={{ flex: 1 }}>
            <Scroll contentContainerStyle={styles.scroll}>
                <Section
                    title={t('settings.general.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <LanguageOption isFirst={true} />
                    <HeadingFontOption />
                    <ThemeOption />
                </Section>

                <Section
                    title={t('settings.notes.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <SelectOptionList options={NOTES_SELECT_OPTIONS} isLast={false} />
                    <DefaultNoteFolderOption isLast={true} />
                </Section>

                <Section
                    title={t('settings.editor.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <SelectOptionList options={EDITOR_SELECT_OPTIONS} />
                </Section>

                <Section
                    title={t('settings.daily_note.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <DailyNoteOption />
                </Section>

                <Section
                    title={t('settings.links.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <WikiLinksOption />
                </Section>

                <Section
                    title={t('settings.attachments.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <AttachmentsOption />
                </Section>

                {isDevice && <ProSection />}

                <Section
                    title={t('title.about')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <Option
                        title={t('settings.about.github')}
                        description={t('settings.about.features')}
                        rightContent={<OpenInNew color={colors.onBackground} />}
                        onPress={() => Linking.openURL(LINKS.GITHUB)}
                        isFirst={true}
                    />
                    <Option
                        title={t('settings.about.contribute')}
                        description={t('settings.about.translate')}
                        rightContent={<OpenInNew color={colors.onBackground} />}
                        onPress={() => Linking.openURL(LINKS.TRANSLATIONS)}
                    />
                    <AppVersionCard />
                </Section>

            </Scroll>
        </View>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingBottom: SPACING.xxl,
        paddingTop: SPACING.sm,
        gap: SPACING.xxxxl
    },
    section: {
        paddingHorizontal: SPACING.lg
    },
    items: {
        gap: SPACING.xxxs
    }
})
