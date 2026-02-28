import { useTranslation } from 'react-i18next'
import { LargeInput, Section } from '@/components'
import { CategoryCarousel, DateNote } from '../notes'

export function Header({
    title, setTitle,
    createdAt, updatedAt,
    categories, setCategories,
    onOpenCategories
}) {
    const { t } = useTranslation()

    const onCategories = (id) => {
        if (!categories.includes(id)) {
            setCategories([...categories, id])
        } else {
            setCategories(categories.filter((categoryId) => categoryId !== id))
        }
    }

    return (
        <>
            <Section
                containerStyle={{ paddingHorizontal: 16 }}
            >
                <LargeInput
                    bold
                    multiline
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('placeholder.title')}
                />
            </Section>

            {(createdAt || updatedAt) && (
                <DateNote
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                />
            )}

            <Section
                title={t('title.categories')}
                containerStyle={{ paddingVertical: 16 }}
            >
                <CategoryCarousel
                    categories={categories}
                    onCategories={onCategories}
                    onCategoriesModal={onOpenCategories}
                />
            </Section>
        </>
    )
}
