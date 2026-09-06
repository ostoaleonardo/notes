import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { IconActionButton, RecentsButton } from '@/components'
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
            <IconActionButton
                icon={Plus}
                onPress={onCreateNote}
                accessibilityLabel={t('notes.create')}
            />

            <RecentsButton
                onPress={onOpenRecents}
                count={recentCount}
            />

            <IconActionButton
                icon={UploadFile}
                onPress={onImportNote}
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
