import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { FilterToggle } from './filter-toggle'

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
            {buttons.map((button, index) => (
                <View
                    key={button.label}
                    onLayout={equalWidth ? (event) => onButtonLayout(button.label, event) : undefined}
                >
                    <FilterToggle
                        position={index === 0 ? 'first' : index === buttons.length - 1 ? 'last' : 'middle'}
                        pill={pill}
                        minWidth={maxWidth}
                        {...button}
                    />
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: 2,
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
