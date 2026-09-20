import { isDevice } from 'expo-device'
import { Linking, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { Languages } from '@/screens/modals/languages'
import { ProSection } from '@/screens/settings/pro-section'
import { ThemeOption } from '@/screens/settings/theme-option'
import { AppVersionCard } from '@/screens/settings/app-version-card'
import { Option } from '@/screens/settings/option'
import { WikiLinksOption } from '@/screens/settings/wiki-links-option'
import { StartupOption } from '@/screens/settings/startup-option'
import { ModalSheet } from '@/components/modal/modal-sheet'
import { Scroll } from '@/components/animated/scroll'
import { Section } from '@/components/section'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'

import { ArrowForward } from '@/icons/arrow-forward'
import { OpenInNew } from '@/icons/open-in-new'

import { LINKS } from '@/constants/links'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const {
        ref: languagesBottomRef,
        onOpen: onOpenLanguages,
        onClose: onCloseLanguages
    } = useBottomSheet()

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
                        onPress={onOpenLanguages}
                        isFirst={true}
                    />
                    <ThemeOption />
                </Section>

                <Section
                    title={t('settings.notes')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <StartupOption />
                </Section>

                <Section
                    title={t('settings.files_links')}
                    containerStyle={styles.section}
                    contentStyle={styles.items}
                >
                    <WikiLinksOption />
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

                <ModalSheet
                    ref={languagesBottomRef}
                    onClose={onCloseLanguages}
                    snapPoints={['50%', '95%']}
                >
                    <Languages />
                </ModalSheet>
            </Scroll>
        </View>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingBottom: 24,
        paddingTop: 8,
        gap: 40
    },
    section: {
        paddingHorizontal: 16
    },
    items: {
        gap: 3
    }
})
