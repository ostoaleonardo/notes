import { Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function DeleteAction({ onPress }) {
    const { t } = useTranslation()

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            <Typography
                uppercase
                variant='caption'
                color={COLORS.common.white}
            >
                {t('button.delete')}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        marginRight: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.common.accent
    }
})
