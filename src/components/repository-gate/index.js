import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Pressable } from '../button'
import { Typography } from '../typography'
import { useRepositories } from '@/hooks'
import { FONTS } from '@/constants'

export function RepositoryGate({ children }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { loading, activeRepository, addRepository } = useRepositories()

    if (loading) return null

    if (!activeRepository) {
        return (
            <View
                style={{
                    ...styles.container,
                    backgroundColor: colors.background
                }}
            >
                <View style={{ gap: 16 }}>
                    <Typography
                        fontSize={32}
                        textAlign='center'
                        styleProps={{ fontFamily: FONTS.nType82Headline }}
                    >
                        {t('repositories.choose_title')}
                    </Typography>
                    <Typography
                        opacity={0.6}
                        textAlign='center'
                    >
                        {t('repositories.choose_message')}
                    </Typography>
                </View>

                <Pressable
                    compact={true}
                    onPress={addRepository}
                >
                    {t('repositories.choose_button')}
                </Pressable>
            </View>
        )
    }

    return children
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
