import { memo, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { SearchSnippet } from './search-snippet'
import { EntityRow } from '@/screens/connections/entity-row'
import { useTheme } from '@/ui/hooks/use-theme'

import { getSnippets } from '@/utils/search-context'
import { getSearchText } from '@/utils/search-text'
import { makeEntity } from '@/utils/connection-model'

import { CONNECTION_TYPES } from '@/constants/connections'
import { SPACING } from '@/constants/theme'
import { TINT } from '@/ui/tokens/transparent'

export const SearchResultRow = memo(({
    note,
    caption,
    highlights,
    snippetLimit,
    title,
    onPress
}) => {
    const { colors } = useTheme()

    const entity = useMemo(() => makeEntity(CONNECTION_TYPES.NOTE, note.path), [note.path])
    const snippets = useMemo(
        () => getSnippets(getSearchText(note), highlights, snippetLimit),
        [note, highlights, snippetLimit]
    )

    const handlePress = useCallback(() => onPress(entity), [onPress, entity])

    return (
        <EntityRow
            entity={entity}
            title={title}
            caption={caption}
            background={colors.surfaceVariant}
            onPress={onPress}
        >
            {snippets.length > 0 ? (
                <Pressable
                    style={styles.snippets}
                    onPress={handlePress}
                >
                    {snippets.map((snippet) => (
                        <SearchSnippet
                            key={snippet.text}
                            snippet={snippet}
                            color={colors.accentText}
                            background={colors.accentText + TINT.fill}
                        />
                    ))}
                </Pressable>
            ) : undefined}
        </EntityRow>
    )
})

const styles = StyleSheet.create({
    snippets: {
        gap: SPACING.xxs
    }
})
