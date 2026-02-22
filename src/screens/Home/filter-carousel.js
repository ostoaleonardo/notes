import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { AnimatedView, Chip, Scroll } from '@/components'
import { useCategories } from '@/hooks'
import { Close } from '@/icons'

export function FilterCarousel({ filter, onFilter }) {
    const { colors } = useTheme()
    const { categories } = useCategories()
    const { onBackground } = colors

    const carousel = categories.filter(({ id }) => id !== 'all')

    return (
        <View style={styles.container}>
            <Scroll
                horizontal
                overScrollMode='never'
                contentContainerStyle={{
                    ...styles.scroll,
                    paddingBottom: carousel.length && 8
                }}
            >
                {filter.size > 0 && (
                    <AnimatedView>
                        <IconButton
                            size={12}
                            mode='outlined'
                            style={{ marginVertical: 0 }}
                            onPress={() => onFilter('all')}
                            icon={() => <Close color={onBackground} />}
                        />
                    </AnimatedView>
                )}

                {carousel.map(({ id, name }) => (
                    <Chip
                        key={id}
                        onPress={() => onFilter(id)}
                        mode={filter.has(id) ? 'flat' : 'outlined'}
                    >
                        {name}
                    </Chip>
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
        gap: 4,
        alignItems: 'center',
        paddingHorizontal: 16
    }
})
