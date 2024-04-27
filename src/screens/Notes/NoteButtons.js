import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, IconButton } from '@/components'
import { Lock, Unlock } from '@/icons'
import { COLORS } from '@/constants'

const HOME_ROUTE = '/(drawer)/(stack)/home'

export function NoteButtons({ onSave, onOpenModal, hasPassword }) {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <View style={styles.rowContainer}>
                <Button
                    flex={1}
                    variant='primary'
                    label={t('button.save')}
                    onPress={onSave}
                />
                <IconButton
                    size='md'
                    variant='secondary'
                    onPress={() => onOpenModal(true)}
                    icon={
                        hasPassword
                            ? <Lock
                                width={20}
                                height={20}
                                color={COLORS.background}
                            />
                            : <Unlock
                                width={20}
                                height={20}
                                color={COLORS.background}
                            />
                    }
                />
            </View>
            <Button
                variant='outline'
                label={t('button.cancel')}
                onPress={() => router.navigate(HOME_ROUTE)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        marginTop: 32,
        paddingHorizontal: 24,
    },
    rowContainer: {
        width: '100%',
        gap: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})

