import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { AppVersionCard, Section, Option, Typography, Separator } from '@/components'
import { ArrowForward } from '@/icons'
import { Languages } from '@/screens'
import { useBottomSheet } from '@/hooks'
import { ROUTES } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { ref, onOpen, onClose } = useBottomSheet()

    return (
        <View style={styles.container}>
            <Section>
                <Option
                    onPress={onOpen}
                    rightContent={
                        <ArrowForward
                            color={colors.onBackground}
                        />
                    }
                >
                    <View style={{ gap: 4 }}>
                        <Typography
                            uppercase
                        >
                            {t('title.language')}
                        </Typography>
                        <Typography
                            opacity={0.5}
                            variant='caption'
                        >
                            {t('language')}
                        </Typography>
                    </View>
                </Option>

                <Option
                    onPress={() => router.push(ROUTES.THEME)}
                    rightContent={
                        <ArrowForward
                            color={colors.onBackground}
                        />
                    }
                >
                    <Typography
                        uppercase
                    >
                        {t('settings.theme')}
                    </Typography>
                </Option>
            </Section>

            <Separator style={{ marginHorizontal: 24 }} />

            <Section
                title={t('title.about')}
            >
                <AppVersionCard />
            </Section>

            <Languages
                ref={ref}
                onClose={onClose}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
        // paddingVertical: 24
    }
})
