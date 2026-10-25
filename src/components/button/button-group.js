import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { ToggleButton } from './toggle-button'
import { PositionGroup } from '@/components/position-group'

import { expandSelected as expandButtons, getMinWidth } from '@/utils/toggle-group'

import { BUTTON } from '@/constants/components'

export function ButtonGroup({
    buttons,
    background,
    style,
    chip = false,
    equalWidth = true,
    expandSelected = false
}) {
    const { colors } = useTheme()
    const [widths, setWidths] = useState({})

    const onWidth = useCallback((label, width) => {
        setWidths((current) => (
            current[label] === width ? current : { ...current, [label]: width }
        ))
    }, [])

    const items = useMemo(() => (
        expandSelected ? expandButtons(buttons) : buttons
    ), [buttons, expandSelected])

    const labeled = chip ? items.map((button) => ({ ...button, showLabel: true })) : items
    const minWidth = equalWidth ? getMinWidth(labeled, widths) : undefined

    return (
        <View style={[styles.group, style]}>
            <PositionGroup>
                {items.map((button) => (
                    <ToggleButton
                        key={button.label}
                        chip={chip}
                        background={background ?? colors.surfaceVariant}
                        color={colors.onBackground}
                        minWidth={minWidth}
                        onWidth={onWidth}
                        {...button}
                    />
                ))}
            </PositionGroup>
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: BUTTON.groupGap,
        flexDirection: 'row'
    }
})
