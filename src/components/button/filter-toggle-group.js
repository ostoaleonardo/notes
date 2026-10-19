import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { FilterToggle } from './filter-toggle'
import { PositionGroup } from '@/components/position-group'

import { SPACING } from '@/constants/theme'

export function FilterToggleGroup({ buttons, pill = false, equalWidth = false }) {
    const [widths, setWidths] = useState({})

    const onButtonLayout = useCallback((label, event) => {
        const width = event.nativeEvent.layout.width

        setWidths((previous) => (previous[label] === width ? previous : { ...previous, [label]: width }))
    }, [])

    const maxWidth = equalWidth && Object.keys(widths).length > 0
        ? Math.max(...Object.values(widths))
        : undefined

    return (
        <View style={styles.group}>
            <PositionGroup>
                {buttons.map((button) => (
                    <View
                        key={button.label}
                        onLayout={equalWidth ? (event) => onButtonLayout(button.label, event) : undefined}
                    >
                        <FilterToggle
                            pill={pill}
                            minWidth={maxWidth}
                            {...button}
                        />
                    </View>
                ))}
            </PositionGroup>
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: SPACING.xxxs,
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
