import { isDevice } from 'expo-device'
import { Linking, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet, Scroll, Section } from '@/components'
import { Languages } from '@/screens/modals'
import { PremiumSection, ThemeOption } from '@/screens/settings'
import { AppVersionCard, Option } from '@/screens'
import { useBottomSheet, useIconProps } from '@/hooks'
import { ArrowForward, OpenInNew } from '@/icons'
import { LINKS } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()
    const iconProps = useIconProps()

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
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={onOpenLanguages}
                        isFirst={true}
                    />
                    <ThemeOption />
                </Section>

                {isDevice && <PremiumSection />}

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
