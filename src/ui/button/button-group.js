import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ToggleButton } from './toggle-button'
import { PositionGroup } from '@/ui/position-group'
import { useTheme } from '@/ui/hooks/use-theme'

import { getControlBackground } from '@/ui/utils/control-background'
import { expandSelected as expandButtons, getMinWidth } from '@/ui/utils/toggle-group'

import { BUTTON, CONTROL_TOUCH_INSET } from '@/ui/tokens/components'

export const ButtonGroup = ({
    buttons,
    background,
    style,
    chip = false,
    equalWidth = true,
    expandSelected = false
}) => {
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
                        background={background ?? getControlBackground(colors)}
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
        flexDirection: 'row',
        marginVertical: CONTROL_TOUCH_INSET
    }
})
