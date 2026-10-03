import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { FONTS } from '@/constants/fonts'
import { SPACING } from '@/constants/spacing'

export function Intro() {
    const { t } = useTranslation()

    return (
        <AnimatedView style={styles.container}>
            <View style={{ gap: SPACING.lg }}>
                <Typography
                    fontSize={32}
                    textAlign='center'
                    styleProps={{ fontFamily: FONTS.nType82Headline }}
                >
                    {t('notes.intro_title')}
                </Typography>
                <Typography
                    opacity={0.6}
                    textAlign='center'
                >
                    {t('notes.intro_subtitle')}
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
