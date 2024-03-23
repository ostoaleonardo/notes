import { Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function DeleteAction({ onPress }) {
    const { t } = useTranslation()

    return (
        <Pressable
            onPress={onPress}
            style={styles.deleteContainer}
        >
            <Typography
                uppercase
                variant='caption'
            >
                {t('button.delete')}
            </Typography>
        </Pressable>
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
