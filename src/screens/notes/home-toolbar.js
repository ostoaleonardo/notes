import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { RecentsButton } from '@/components'
import { Plus, UploadFile } from '@/icons'

export function HomeToolbar({ onCreateNote, onImportNote, onOpenRecents, recentCount }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.toolbar,
                borderTopColor: colors.outline,
                backgroundColor: colors.background
            }}
        >
            <IconButton
                icon={(props) => <Plus {...props} />}
                onPress={onCreateNote}
                accessibilityLabel={t('notes.create')}
            />

            <RecentsButton
                onPress={onOpenRecents}
                count={recentCount}
            />

            <IconButton
                onPress={onImportNote}
                icon={(props) => <UploadFile {...props} />}
                accessibilityLabel={t('title.import')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    toolbar: {
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1
    }
})
