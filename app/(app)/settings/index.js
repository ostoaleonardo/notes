import { isDevice } from 'expo-device'
import { Linking, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { LanguagesSheet } from '@/screens/settings/languages-sheet'
import { ProSection } from '@/screens/settings/pro-section'
import { ThemeOption } from '@/screens/settings/theme-option'
import { AppVersionCard } from '@/screens/settings/app-version-card'
import { Option } from '@/screens/settings/option'
import { WikiLinksOption } from '@/screens/settings/wiki-links-option'
import { AttachmentsOption } from '@/screens/settings/attachments-option'
import { StorageSelectOption } from '@/screens/settings/storage-select-option'
import { DailyNoteOption } from '@/screens/settings/daily-note-option'
import { Scroll } from '@/components/animated/scroll'
import { Section } from '@/components/section'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'

import { ArrowForward } from '@/icons/arrow-forward'
import { OpenInNew } from '@/icons/open-in-new'

import { LINKS } from '@/constants/links'
import { SPACING } from '@/constants/theme'
import {
    DELETE_BEHAVIOR_SELECT_OPTION,
    EDITOR_SELECT_OPTIONS,
    LAST_EDITOR_SELECT_INDEX,
    STARTUP_SELECT_OPTION
} from '@/constants/settings-select-options'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const languagesSheet = useBottomSheet()

    return (
        <View style={{ flex: 1 }}>
            <Scroll contentContainerStyle={styles.scroll}>
                <Section
                    title={t('settings.general')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <Option
                        title={t('settings.language')}
                        description={t('language')}
                        rightContent={<ArrowForward color={colors.onBackground} />}
                        onPress={languagesSheet.onOpen}
                        isFirst={true}
                    />
                    <ThemeOption />
                </Section>

                <Section
                    title={t('settings.notes')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <StorageSelectOption
                        {...STARTUP_SELECT_OPTION}
                        isFirst={true}
                    />
                    {EDITOR_SELECT_OPTIONS.map((option, index) => (
                        <StorageSelectOption
                            key={option.storageKey}
                            {...option}
                            isLast={index === LAST_EDITOR_SELECT_INDEX}
                        />
                    ))}
                </Section>

                <Section
                    title={t('settings.daily_note')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <DailyNoteOption />
                </Section>

                <Section
                    title={t('settings.deleted_files')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <StorageSelectOption
                        {...DELETE_BEHAVIOR_SELECT_OPTION}
                        isFirst={true}
                        isLast={true}
                    />
                </Section>

                <Section
                    title={t('settings.files_links')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <WikiLinksOption />
                </Section>

                <Section
                    title={t('settings.attachments')}
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
                        title={t('settings.github')}
                        description={t('settings.features')}
                        rightContent={<OpenInNew color={colors.onBackground} />}
                        onPress={() => Linking.openURL(LINKS.GITHUB)}
                        isFirst={true}
                    />
                    <Option
                        title={t('settings.contribute')}
                        description={t('settings.translate')}
                        rightContent={<OpenInNew color={colors.onBackground} />}
                        onPress={() => Linking.openURL(LINKS.TRANSLATIONS)}
                    />
                    <AppVersionCard />
                </Section>

                <LanguagesSheet sheet={languagesSheet} />
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
        gap: SPACING.xxs
    }
})
