import { useTranslation } from 'react-i18next'

import { ButtonGroup } from '@/components/button/button-group'

import { togglePinnedQualifier, toggleImageQualifier, toggleContentQualifier } from '@/utils/search-query'

import { Check } from '@/icons/check'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { NoteStack } from '@/icons/note-stack'
import { Picture } from '@/icons/picture'
import { Plus } from '@/icons/plus'

import { ICON_SIZE } from '@/constants/theme'

export function SearchToggleFilters({ query, setQuery, parsed, saved, onToggleSave }) {
    const { t } = useTranslation()

    const trimmedQuery = query.trim()
    const canSave = !!trimmedQuery
    const isSaved = saved.some((entry) => entry.query === trimmedQuery)

    return (
        <>
            <ButtonGroup
                buttons={[
                    {
                        icon: NoteStack,
                        label: t('search.in_content'),
                        iconSize: ICON_SIZE.md,
                        selected: parsed.inContent,
                        onPress: () => setQuery(toggleContentQualifier(query))
                    }
                ]}
            />

            <ButtonGroup
                chip
                equalWidth={false}
                buttons={[
                    {
                        icon: Picture,
                        label: t('search.has_image'),
                        selected: parsed.hasImage,
                        onPress: () => setQuery(toggleImageQualifier(query))
                    },
                    {
                        icon: parsed.pinned ? KeepFilled : Keep,
                        label: t('search.pinned'),
                        selected: parsed.pinned,
                        onPress: () => setQuery(togglePinnedQualifier(query))
                    },
                    {
                        icon: isSaved ? Check : Plus,
                        label: t(isSaved ? 'search.unsave' : 'search.save'),
                        selected: isSaved,
                        disabled: !canSave,
                        onPress: onToggleSave
                    }
                ]}
            />
        </>
    )
}
