import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Section } from './Screen'
import { Typography } from './Text'
import { Scroll } from './Scroll'
import { SwipeableCategory } from './SwipeableCard'
import { useCategories } from '@/hooks'

export function CategoriesContainer({ onPress }) {
    const { t } = useTranslation()
    const { categories, removeCategory } = useCategories()
    const [openCategory, setOpenCategory] = useState(null)

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
                <Scroll contentStyle={styles.categoryCardsContainer}>
                    {categories.slice(1).map(({ id, name }) => (
                        <SwipeableCategory
                            key={id}
                            category={name}
                            onPress={() => onPress(id)}
                            isOpen={openCategory === id}
                            onOpen={() => setOpenCategory(id)}
                            onDelete={() => removeCategory(id)}
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
        justifyContent: 'center',
    },
    categoryCardsContainer: {
        width: '100%',
        gap: 16,
        paddingBottom: 24,
    },
})
