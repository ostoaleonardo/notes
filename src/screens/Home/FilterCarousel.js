import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, Scroll } from '@/components'
import { useCategories } from '@/hooks'

export function FilterCarousel({ selectedFilter, setSelectedFilter }) {
    const { t } = useTranslation()
    const { categories } = useCategories()

    return (
        <View style={styles.container}>
            <Scroll
                horizontal
                overScrollMode='never'
                contentContainerStyle={styles.scroll}
            >
                {categories.map(({ id, name }) => (
                    <Chip
                        key={id}
                        onPress={() => setSelectedFilter(id)}
                        variant={id === selectedFilter ? 'primary' : 'bordered'}
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
    scroll: {
        flexGrow: 1,
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 24
    }
})
