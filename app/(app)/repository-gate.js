import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, Typography } from '@/components'
import { useNotes, useRepositories } from '@/hooks'
import { FONTS } from '@/constants'

export default function RepositoryGate() {
    const { t } = useTranslation()
    const { loading } = useNotes()
    const { activeRepository, addRepository } = useRepositories()

    return (
        <View style={styles.container}>
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
                loading={activeRepository && loading}
                disabled={activeRepository && loading}
            >
                {t('repositories.choose_button')}
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
