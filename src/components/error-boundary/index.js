import { StyleSheet, View, useColorScheme } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, Typography } from '@/components'
import { COLORS, FONTS } from '@/constants'

export function ErrorBoundary({ retry }) {
    const { t } = useTranslation()
    const colors = COLORS[useColorScheme() === 'light' ? 'light' : 'dark']

    return (
        <View style={{ ...styles.container, backgroundColor: colors.background }}>
            <View style={{ gap: 16 }}>
                <Typography
                    fontSize={32}
                    textAlign='center'
                    color={colors.onBackground}
                    styleProps={{ fontFamily: FONTS.nType82Headline }}
                >
                    {t('error_boundary.title')}
                </Typography>
                <Typography
                    opacity={0.6}
                    textAlign='center'
                    color={colors.onBackground}
                >
                    {t('error_boundary.message')}
                </Typography>
            </View>

            <Pressable
                onPress={retry}
                buttonColor={colors.onBackground}
                textColor={colors.background}
            >
                {t('button.try_again')}
            </Pressable>
        </View>
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
