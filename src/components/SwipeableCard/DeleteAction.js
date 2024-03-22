import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function DeleteAction() {
    const { t } = useTranslation()

    return (
        <View style={styles.deleteContainer}>
            <Typography
                uppercase
                variant='caption'
            >
                {t('button.delete')}
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    deleteContainer: {
        width: 100,
        marginRight: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
})
