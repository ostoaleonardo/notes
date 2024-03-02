import { ScrollView, StyleSheet, View } from 'react-native'
import { useEffect, useState } from 'react'
import { Chip } from './Chip'
import { useCategories, useNotes } from '../hooks'
import { useTranslation } from 'react-i18next'

export function Categories({ setFilteredNotes }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { categories } = useCategories()
    const [selected, setSelected] = useState('All')

    useEffect(() => {
        if (selected === 'All') {
            setFilteredNotes(notes)
        } else {
            const filtered = notes.filter((note) => note.categories.includes(selected))
            setFilteredNotes(filtered)
        }
    }, [selected, notes])

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
                            onPress={() => setSelected(category)}
                            variant={category === selected ? 'solid' : 'bordered'}
                            label={category === 'All' ? t('categories.all') : category}
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
