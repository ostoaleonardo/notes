import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LargeInput, Section } from '@/components'
import { TagCarousel, DateNote } from '../notes'

export function Header({
    title, setTitle,
    createdAt, updatedAt,
    tags, setTags,
    onOpenTags
}) {
    const { t } = useTranslation()

    const onTags = useCallback((id) => {
        setTags(prev => prev.includes(id)
            ? prev.filter((tag) => tag !== id)
            : [...prev, id]
        )
    }, [setTags])

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
                containerStyle={{ paddingTop: 8, paddingBottom: 24 }}
            >
                <TagCarousel
                    tags={tags}
                    onTags={onTags}
                    onTagsModal={onOpenTags}
                />
            </Section>
        </>
    )
}
