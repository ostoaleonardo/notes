import { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { IconToggleGroup } from '@/components/button/icon-toggle-group'
import { Typography } from '@/components/typography'

import { ArrowBack } from '@/icons/arrow-back'
import { ArrowForward } from '@/icons/arrow-forward'

import { HERO_CARD } from '@/constants/components'
import { FOCUS } from '@/constants/connections'
import { SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export const FocusPager = memo(function FocusPager({ page, pages, onTurn }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const previous = useMemo(() => [{
        icon: ArrowBack,
        label: t('connections.pager.previous'),
        disabled: page === 0,
        onPress: () => onTurn(-1)
    }], [t, page, onTurn])

    const next = useMemo(() => [{
        icon: ArrowForward,
        label: t('connections.pager.next'),
        disabled: page === pages - 1,
        onPress: () => onTurn(1)
    }], [t, page, pages, onTurn])

    return (
        <View style={[styles.pager, { backgroundColor: colors.surface + TRANSPARENT[90] }]}>
            <IconToggleGroup buttons={previous} />
            <Typography styleProps={styles.label}>{`${page + 1} / ${pages}`}</Typography>
            <IconToggleGroup buttons={next} />
        </View>
    )
})

const styles = StyleSheet.create({
    pager: {
        gap: SPACING.sm,
        padding: SPACING.xs,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: HERO_CARD.cardRadius
    },
    label: {
        minWidth: FOCUS.pagerLabelWidth,
        textAlign: 'center'
    }
})
