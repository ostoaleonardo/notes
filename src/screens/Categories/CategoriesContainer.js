import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AnimatedList, Section, SwipeableCategory } from '@/components'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export function CategoriesContainer({ onPress }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { categories, deleteCategory } = useCategories()

    const [isOpen, setIsOpen] = useState(null)

    const onDelete = (id) => {
        deleteCategory(id)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <Section
            containerStyle={styles.container}
            contentStyle={styles.container}
        >
            <AnimatedList
                data={categories.slice(1)}
                keyExtractor={({ id }) => id}
                emptyLabel={t('message.noCategories')}
                renderItem={({ item }) => (
                    <SwipeableCategory
                        category={item.name}
                        isOpen={isOpen === item.id}
                        onPress={() => onPress(item.id)}
                        onOpen={() => setIsOpen(item.id)}
                        onDelete={() => onDelete(item.id)}
                    />
                )}
            />
        </Section>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    list: {
        flexGrow: 1,
        paddingBottom: 24,
        gap: 16
    }
})
