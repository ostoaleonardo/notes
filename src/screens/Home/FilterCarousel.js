import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, Scroll } from '@/components'
import { useCategories, useNotes } from '@/hooks'

export function FilterCarousel({ setFilteredNotes }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { categories } = useCategories()
    const [selected, setSelected] = useState('all')

    useEffect(() => {
        if (selected === 'all') {
            setFilteredNotes(notes)
        } else {
            const filtered = notes.filter(({ categories }) => categories.includes(selected))
            setFilteredNotes(filtered)
        }
    }, [selected, notes])

    return (
        <View style={styles.container}>
            <Scroll
                horizontal
                overScrollMode='never'
                contentContainerStyle={{
                    flexGrow: 1,
                    gap: 8,
                    paddingVertical: 16,
                    paddingHorizontal: 24
                }}
            >
                {categories.map(({ id, name }) => (
                    <Chip
                        key={id}
                        onPress={() => setSelected(id)}
                        variant={id === selected ? 'primary' : 'bordered'}
                        label={id === 'all' ? t('categories.all') : name}
                    />
                ))}
            </Scroll>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    scrollContainer: {
        width: '100%',
        paddingVertical: 16
    },
    chipsContainer: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24
    }
})
