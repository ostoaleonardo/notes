import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ButtonGroup } from '@/ui/button/button-group'
import { Typography } from '@/ui/typography'
import { DrawerSortMenu } from '@/components/drawer/drawer-sort-menu'

import { Check } from '@/ui/icons/check'
import { Add } from '@/icons/add'
import { Notes } from '@/icons/notes'
import { Title } from '@/icons/title'

import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchResultsToolbar = ({
    count,
    sort,
    matchCase,
    moreContext,
    isSaved,
    canSave,
    onChangeSort,
    onToggleMatchCase,
    onToggleMoreContext,
    onToggleSave
}) => {
    const { t } = useTranslation()

    const buttons = useMemo(() => [
        {
            icon: Title,
            label: t('search.match_case'),
            selected: matchCase,
            testID: TEST_IDS.SEARCH_MATCH_CASE,
            onPress: onToggleMatchCase
        },
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
    ], [t, matchCase, moreContext, isSaved, canSave, onToggleMatchCase, onToggleMoreContext, onToggleSave])

    return (
        <View style={styles.container}>
            <Typography variant='bodySmall'>
                {t('search.results', { count })}
            </Typography>

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
        paddingHorizontal: SPACING.lg
    },
    actions: {
        gap: SPACING.xs,
        alignItems: 'center',
        flexDirection: 'row'
    }
})
