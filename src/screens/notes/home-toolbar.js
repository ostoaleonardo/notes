import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { RecentsButton } from '@/components/app-bar/recents-button'
import { ToolbarSurface } from '@/ui/toolbar-surface'
import { IconButton } from '@/ui/button/icon-button'

import { Add } from '@/icons/add'
import { Search } from '@/icons/search'
import { UploadFile } from '@/icons/upload-file'
import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export function HomeToolbar({ onCreateNote, onImportNote, onOpenRecents, onOpenSearch, recentCount }) {
    const { t } = useTranslation()

    return (
        <ToolbarSurface>
            <View style={styles.row}>
                <IconButton
                    style={styles.button}
                    icon={Add}
                    label={t('notes.create')}
                    testID={TEST_IDS.HOME_CREATE_NOTE}
                    onPress={onCreateNote}
                />

                <IconButton
                    style={styles.button}
                    icon={Search}
                    label={t('drawer.search')}
                    testID={TEST_IDS.HOME_SEARCH}
                    onPress={onOpenSearch}
                />

                <RecentsButton
                    onPress={onOpenRecents}
                    testID={TEST_IDS.HOME_RECENTS}
                    count={recentCount}
                    buttonStyle={styles.button}
                />

                <IconButton
                    style={styles.button}
                    icon={UploadFile}
                    label={t('title.import')}
                    testID={TEST_IDS.HOME_IMPORT}
                    onPress={onImportNote}
                />
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
