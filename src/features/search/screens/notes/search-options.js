import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ButtonGroup } from '@/ui/button/button-group'

import { MatchCase } from '@/icons/match-case'
import { Tune } from '@/icons/tune'

import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchOptions = ({
    matchCase,
    panelOpen,
    onToggleMatchCase,
    onTogglePanel
}) => {
    const { t } = useTranslation()

    const buttons = useMemo(() => [
        {
            icon: MatchCase,
            label: t('search.match_case'),
            selected: matchCase,
            testID: TEST_IDS.SEARCH_MATCH_CASE,
            onPress: onToggleMatchCase
        },
        {
            icon: Tune,
            label: t('search.filter'),
            selected: panelOpen,
            testID: TEST_IDS.SEARCH_FILTER_BUTTON,
            onPress: onTogglePanel
        }
    ], [t, matchCase, panelOpen, onToggleMatchCase, onTogglePanel])

    return (
        <View style={styles.container}>
            <ButtonGroup buttons={buttons} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginEnd: SPACING.lg,
        paddingTop: SPACING.xxs
    }
})
