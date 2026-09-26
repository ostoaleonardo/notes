import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Pressable } from '@/components/button/pressable'
import { Typography } from '@/components/typography'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'

import { FONTS } from '@/constants/fonts'

export default function RepositoryGate() {
    const { t } = useTranslation()
    const { loading } = useNotes()
    const { activeRepository, addRepository } = useRepositories()

    const onAddRepository = async () => {
        const result = await addRepository()
        if (result === 'error') showSnackbar(t('repositories.add_failed'))
    }

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
                onPress={onAddRepository}
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
