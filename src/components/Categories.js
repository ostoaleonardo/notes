import { ScrollView, StyleSheet, View } from 'react-native'
import { Chip } from './Chip/Chip'
import { useState } from 'react'
import { useCategories } from '../hooks'

export function Categories() {
    const { categories } = useCategories()
    const [selected, setSelected] = useState('All')

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                overScrollMode='never'
                style={styles.scrollContainer}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.chipsContainer}>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            onPress={() => setSelected(category)}
                            variant={category === selected ? 'solid' : 'bordered'}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    scrollContainer: {
        width: '100%',
        paddingVertical: 16,
    },
    chipsContainer: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
})
