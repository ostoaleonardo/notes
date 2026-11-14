import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { PermissionCard } from '@/ui/permission-card'

import { useDirectAccessPrompt } from '@/hooks/use-direct-access-prompt'

import { Close } from '@/icons/close'
import { FolderManaged } from '@/icons/folder-managed'

import { SPACING } from '@/constants/theme'

export const DirectAccessCard = () => {
    const { t } = useTranslation()
    const { visible, onRequest, onDismiss } = useDirectAccessPrompt()

    if (!visible) return null

    return (
        <View style={styles.container}>
            <PermissionCard
                title={t('direct_access.title')}
                message={t('direct_access.message')}
                icon={FolderManaged}
                dismissIcon={Close}
                dismissLabel={t('button.close')}
                onPress={onRequest}
                onDismiss={onDismiss}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg
    }
})
