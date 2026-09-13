import { StyleSheet, View } from 'react-native'

import { FilterToggle } from './filter-toggle'

export function FilterToggleGroup({ buttons }) {
    return (
        <View style={styles.group}>
            {buttons.map((button, index) => (
                <FilterToggle
                    key={button.label}
                    position={index === 0 ? 'first' : index === buttons.length - 1 ? 'last' : 'middle'}
                    {...button}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: 2,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
