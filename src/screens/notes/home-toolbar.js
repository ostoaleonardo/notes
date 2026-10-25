import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, Tooltip } from 'react-native-paper'

import { RecentsButton } from '@/components/app-bar/recents-button'
import { ToolbarSurface } from '@/components/toolbar-surface'

import { Plus } from '@/icons/plus'
import { Search } from '@/icons/search'
import { UploadFile } from '@/icons/upload-file'
import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export function HomeToolbar({ onCreateNote, onImportNote, onOpenRecents, onOpenSearch, recentCount }) {
    const { t } = useTranslation()

    return (
        <ToolbarSurface>
            <View style={styles.row}>
                <Tooltip title={t('notes.create')}>
                    <IconButton
                        style={styles.button}
                        icon={(props) => <Plus {...props} />}
                        onPress={onCreateNote}
                        testID={TEST_IDS.HOME_CREATE_NOTE}
                        accessibilityLabel={t('notes.create')}
                    />
                </Tooltip>

                <Tooltip title={t('drawer.search')}>
                    <IconButton
                        style={styles.button}
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
                    buttonStyle={styles.button}
                />

                <Tooltip title={t('title.import')}>
                    <IconButton
                        style={styles.button}
                        onPress={onImportNote}
                        testID={TEST_IDS.HOME_IMPORT}
                        icon={(props) => <UploadFile {...props} />}
                        accessibilityLabel={t('title.import')}
                    />
                </Tooltip>
            </View>
        </ToolbarSurface>
    )
}

const styles = StyleSheet.create({
    button: {
        margin: SPACING.xxxs
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
