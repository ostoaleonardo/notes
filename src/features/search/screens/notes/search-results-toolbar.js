import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ButtonGroup } from '@/ui/button/button-group'
import { Progress } from '@/ui/progress'
import { Typography } from '@/ui/typography'
import { DrawerSortMenu } from '@/features/drawer/components/drawer/drawer-sort-menu'
import { getSearchSummary } from '@/features/search/utils/search-summary'

import { Check } from '@/ui/icons/check'
import { Add } from '@/icons/add'
import { Notes } from '@/icons/notes'

import { CONTROL_TOUCH_INSET } from '@/ui/tokens/components'
import { ICON_SIZE } from '@/ui/tokens/theme'
import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchResultsToolbar = ({
    count,
    partial,
    searching,
    showLoader,
    sort,
    moreContext,
    isSaved,
    canSave,
    onChangeSort,
    onToggleMoreContext,
    onToggleSave
}) => {
    const { t } = useTranslation()

    const buttons = useMemo(() => [
        {
            icon: Notes,
            label: t('search.more_context'),
            selected: moreContext,
            testID: TEST_IDS.SEARCH_CONTEXT,
            onPress: onToggleMoreContext
        },
        {
            icon: isSaved ? Check : Add,
            label: t(isSaved ? 'search.unsave' : 'search.save'),
            selected: isSaved,
            disabled: !canSave,
            testID: TEST_IDS.SEARCH_SAVE,
            onPress: onToggleSave
        }
    ], [t, moreContext, isSaved, canSave, onToggleMoreContext, onToggleSave])

    const { loader, key } = getSearchSummary({ showLoader, searching, partial, count })

    return (
        <View style={styles.container}>
            <View style={styles.summary}>
                {loader && <Progress dimension={ICON_SIZE.md} />}
                <Typography variant='bodySmall'>{t(key, { count })}</Typography>
            </View>

            <View style={styles.actions}>
                <ButtonGroup buttons={buttons} />
                <DrawerSortMenu
                    sort={sort}
                    testID={TEST_IDS.SEARCH_SORT}
                    onChange={onChangeSort}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: SPACING.sm,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: -CONTROL_TOUCH_INSET,
        paddingHorizontal: SPACING.lg
    },
    summary: {
        gap: SPACING.xs,
        alignItems: 'center',
        flexDirection: 'row'
    },
    actions: {
        gap: SPACING.xs,
        alignItems: 'center',
        flexDirection: 'row'
    }
})
