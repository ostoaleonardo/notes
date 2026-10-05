import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'

import { RecentsButton } from '@/components/app-bar/recents-button'

import { Plus } from '@/icons/plus'
import { Search } from '@/icons/search'
import { UploadFile } from '@/icons/upload-file'
import { SPACING } from '@/constants/spacing'
import { TEST_IDS } from '@/constants/test-ids'

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
                    testID={TEST_IDS.HOME_CREATE_NOTE}
                    accessibilityLabel={t('notes.create')}
                />
            </Tooltip>

            <Tooltip title={t('drawer.search')}>
                <IconButton
                    onPress={onOpenSearch}
                    testID={TEST_IDS.HOME_SEARCH}
                    icon={(props) => <Search {...props} />}
                    accessibilityLabel={t('drawer.search')}
                />
            </Tooltip>

            <RecentsButton
                onPress={onOpenRecents}
                testID={TEST_IDS.HOME_RECENTS}
                count={recentCount}
            />

            <Tooltip title={t('title.import')}>
                <IconButton
                    onPress={onImportNote}
                    testID={TEST_IDS.HOME_IMPORT}
                    icon={(props) => <UploadFile {...props} />}
                    accessibilityLabel={t('title.import')}
                />
            </Tooltip>
        </View>
    )
}

const styles = StyleSheet.create({
    toolbar: {
        paddingHorizontal: SPACING.xxs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1
    }
})
