import { isDevice } from 'expo-device'
import { Linking, Platform, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LanguageOption } from '@/screens/settings/language-option'
import { ProSection } from '@/screens/settings/pro-section'
import { HeadingFontOption } from '@/screens/settings/heading-font-option'
import { ThemeOption } from '@/screens/settings/theme-option'
import { AppVersionCard } from '@/screens/settings/app-version-card'
import { ListItem } from '@/ui/list-item'
import { useTheme } from '@/ui/hooks/use-theme'
import { WidgetsOption } from '@/screens/settings/widgets-option'
import { WikiLinksOption } from '@/screens/settings/wiki-links-option'
import { AttachmentsOption } from '@/screens/settings/attachments-option'
import { StorageSelectOption } from '@/screens/settings/storage-select-option'
import { StorageSwitchOption } from '@/screens/settings/storage-switch-option'
import { DailyNoteOption } from '@/screens/settings/daily-note-option'
import { DefaultNoteFolderOption } from '@/screens/settings/default-note-folder-option'
import { Scroll } from '@/ui/animated/scroll'
import { Section } from '@/ui/section'

import { OpenInNew } from '@/icons/open-in-new'

import { LINKS } from '@/constants/links'
import { SPACING } from '@/constants/theme'
import { EDITOR_SELECT_OPTIONS, NOTES_SELECT_OPTIONS } from '@/constants/settings-select-options'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { bottom } = useSafeAreaInsets()

    return (
        <View style={{ flex: 1 }}>
            <Scroll contentContainerStyle={[styles.scroll, { paddingBottom: SPACING.xxl + bottom }]}>
                <Section
                    title={t('settings.general.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <LanguageOption />
                    <HeadingFontOption />
                    <ThemeOption />
                </Section>

                <Section
                    title={t('settings.notes.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    {NOTES_SELECT_OPTIONS.map((option) => (
                        <StorageSelectOption
                            key={option.storageKey}
                            {...option}
                        />
                    ))}
                    <DefaultNoteFolderOption />
                </Section>

                <Section
                    title={t('settings.editor.title')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    {EDITOR_SELECT_OPTIONS.map(({ toggle, ...option }) => (
                        toggle
                            ? <StorageSwitchOption key={option.storageKey} {...option} />
                            : <StorageSelectOption key={option.storageKey} {...option} />
                    ))}
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

                {Platform.OS === 'android' && (
                    <Section
                        title={t('settings.widgets.title')}
                        containerStyle={styles.section}
                        contentStyle={styles.items}
                    >
                        <WidgetsOption />
                    </Section>
                )}

                {isDevice && <ProSection />}

                <Section
                    title={t('title.about')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <ListItem
                        title={t('settings.about.github')}
                        description={t('settings.about.features')}
                        rightContent={<OpenInNew color={colors.onBackground} />}
                        onPress={() => Linking.openURL(LINKS.GITHUB)}
                    />
                    <ListItem
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
