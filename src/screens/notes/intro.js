import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AnimatedView, Typography } from '@/components'
import { FONTS } from '@/constants'

export function Intro() {
    const { t } = useTranslation()

    return (
        <AnimatedView style={styles.container}>
            <View style={{ gap: 16 }}>
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
        gap: 32,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
