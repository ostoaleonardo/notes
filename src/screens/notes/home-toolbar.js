import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'

import { RecentsButton } from '@/components/app-bar/recents-button'

import { Plus } from '@/icons/plus'
import { Search } from '@/icons/search'
import { UploadFile } from '@/icons/upload-file'

export function HomeToolbar({ onCreateNote, onImportNote, onOpenRecents, onOpenSearch, recentCount }) {
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
            <Tooltip title={t('notes.create')}>
                <IconButton
                    icon={(props) => <Plus {...props} />}
                    onPress={onCreateNote}
                    accessibilityLabel={t('notes.create')}
                />
            </Tooltip>

            <Tooltip title={t('drawer.search')}>
                <IconButton
                    onPress={onOpenSearch}
                    icon={(props) => <Search {...props} />}
                    accessibilityLabel={t('drawer.search')}
                />
            </Tooltip>

            <RecentsButton
                onPress={onOpenRecents}
                count={recentCount}
            />

            <Tooltip title={t('title.import')}>
                <IconButton
                    onPress={onImportNote}
                    icon={(props) => <UploadFile {...props} />}
                    accessibilityLabel={t('title.import')}
                />
            </Tooltip>
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
