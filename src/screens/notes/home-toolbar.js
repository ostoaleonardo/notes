import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { RecentsButton } from '@/components'
import { useIconProps } from '@/hooks'
import { Plus, UploadFile } from '@/icons'

export function HomeToolbar({ onCreateNote, onImportNote, onOpenRecents, recentCount }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const iconProps = useIconProps()

    return (
        <View
            style={{
                ...styles.toolbar,
                borderTopColor: colors.outline,
                backgroundColor: colors.background
            }}
        >
            <IconButton
                onPress={onCreateNote}
                icon={() => <Plus {...iconProps} />}
                accessibilityLabel={t('notes.create')}
            />

            <RecentsButton
                onPress={onOpenRecents}
                count={recentCount}
            />

            <IconButton
                onPress={onImportNote}
                icon={() => <UploadFile {...iconProps} />}
                accessibilityLabel={t('title.import')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    toolbar: {
        paddingVertical: 3,
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1
    }
})
