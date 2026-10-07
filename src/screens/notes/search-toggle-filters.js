import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'

import { FilterToggleGroup } from '@/components/button/filter-toggle-group'

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
    const { colors } = useTheme()

    const trimmedQuery = query.trim()
    const canSave = !!trimmedQuery
    const isSaved = saved.some((entry) => entry.query === trimmedQuery)

    return (
        <>
            <Tooltip title={t('search.in_content')}>
                <IconButton
                    size={ICON_SIZE.md}
                    mode={parsed.inContent ? 'contained' : 'outlined'}
                    iconColor={parsed.inContent ? colors.background : colors.onBackground}
                    containerColor={parsed.inContent ? colors.onBackground : undefined}
                    onPress={() => setQuery(toggleContentQualifier(query))}
                    icon={(props) => <NoteStack width={ICON_SIZE.md} height={ICON_SIZE.md} {...props} />}
                    accessibilityLabel={t('search.in_content')}
                />
            </Tooltip>

            <FilterToggleGroup
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
