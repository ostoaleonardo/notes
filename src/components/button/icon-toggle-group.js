import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { IconToggle } from './icon-toggle'
import { PositionGroup } from '@/components/position-group'

import { expandSelected as expandButtons, getMinWidth } from '@/utils/toggle-group'

import { BUTTON } from '@/constants/components'

export function IconToggleGroup({ buttons, background, expandSelected = false }) {
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

    const minWidth = getMinWidth(items, widths)

    return (
        <View style={styles.group}>
            <PositionGroup>
                {items.map((button) => (
                    <IconToggle
                        key={button.label}
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
