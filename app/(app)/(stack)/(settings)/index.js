import { Linking, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Section, Scroll } from '@/components'
import { AppVersionCard, Languages, Option } from '@/screens'
import { useBottomSheet } from '@/hooks'
import { ArrowForward, OpenInNew } from '@/icons'
import { LINKS, ROUTES } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const {
        ref: languagesBottomRef,
        onOpen: onOpenLanguages,
        onClose: onCloseLanguages
    } = useBottomSheet()

    const iconProps = {
        color: colors.onBackground
    }

    return (
        <Scroll contentContainerStyle={styles.scroll}>
            <Section
                title={t('settings.general')}
                containerStyle={styles.section}
                contentStyle={styles.items}
            >
                <Option
                    title={t('settings.language')}
                    description={t('language')}
                    rightContent={<ArrowForward {...iconProps} />}
                    onPress={onOpenLanguages}
                    isFirst={true}
                />
                <Option
                    title={t('settings.theme')}
                    rightContent={<ArrowForward {...iconProps} />}
                    onPress={() => router.push(ROUTES.THEME)}
                    isLast={true}
                />
            </Section>

            <Section
                title={t('title.about')}
                containerStyle={styles.section}
                contentStyle={styles.items}
            >
                <Option
                    title={t('settings.github')}
                    description={t('settings.features')}
                    rightContent={<OpenInNew {...iconProps} />}
                    onPress={() => Linking.openURL(LINKS.GITHUB)}
                    isFirst={true}
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
        </Scroll>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingBottom: 24,
        paddingTop: 16,
        gap: 40
    },
    section: {
        paddingHorizontal: 16
    },
    items: {
        gap: 3
    }
})
