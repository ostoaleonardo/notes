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
    const [openCategory, setOpenCategory] = useState(null)

    const handleDeleteCategory = (id) => {
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
                            onPress={() => onPress(id)}
                            isOpen={openCategory === id}
                            onOpen={() => setOpenCategory(id)}
                            onDelete={() => handleDeleteCategory(id)}
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
