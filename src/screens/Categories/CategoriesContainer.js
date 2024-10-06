import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Scroll, Section, SwipeableCategory, Typography } from '@/components'
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
            title={t('title.yourCategories')}
            containerStyle={styles.sectionContainer}
            contentStyle={styles.sectionContainer}
        >
            {categories.length === 1 ? (
                <Typography
                    opacity={0.5}
                >
                    {t('message.noCategories')}
                </Typography>
            ) : (
                <Scroll contentContainerStyle={styles.categoryContainer}>
                    {categories.slice(1).map(({ id, name }) => (
                        <SwipeableCategory
                            key={id}
                            category={name}
                            isOpen={isOpen === id}
                            onPress={() => onPress(id)}
                            onOpen={() => setIsOpen(id)}
                            onDelete={() => onDelete(id)}
                        />
                    ))}
                </Scroll>
            )}
        </Section>
    )
}

const styles = StyleSheet.create({
    sectionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    categoryContainer: {
        flexGrow: 1,
        gap: 16,
        paddingBottom: 24
    }
})
