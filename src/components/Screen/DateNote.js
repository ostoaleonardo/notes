import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Typography } from '../Text'

export function DateNote({ createdAt, updatedAt }) {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <Typography
                uppercase
                opacity={0.5}
                variant='caption'
            >
                {updatedAt
                    ? `${t('editNote.updated')} ${updatedAt}`
                    : `${t('editNote.created')} ${createdAt}`
                }
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 8,
        paddingHorizontal: 24,
    },
})
