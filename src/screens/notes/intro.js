import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { FONTS, SPACING, OPACITY, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function Intro() {
    const { t } = useTranslation()

    return (
        <AnimatedView style={styles.container}>
            <View style={{ gap: SPACING.lg }}>
                <Typography
                    fontSize={TYPOGRAPHY_SIZE_VARIANTS.headlineLarge}
                    textAlign='center'
                    styleProps={{ fontFamily: FONTS.nType82Headline }}
                >
                    {t('notes.intro.title')}
                </Typography>
                <Typography
                    opacity={OPACITY.secondary}
                    textAlign='center'
                >
                    {t('notes.intro.subtitle')}
                </Typography>
            </View>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: SPACING.xxxl,
        padding: SPACING.xxl,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
