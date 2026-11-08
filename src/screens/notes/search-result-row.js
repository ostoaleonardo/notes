import { memo, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { EntityRow } from '@/screens/connections/entity-row'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { getSnippets, splitByRanges } from '@/utils/search-context'
import { makeEntity } from '@/utils/connection-model'

import { CONNECTION_TYPES } from '@/constants/connections'
import { FONTS, SPACING } from '@/constants/theme'

const SNIPPET_LINES = 2

const Snippet = ({ snippet, color }) => {
    const parts = splitByRanges(snippet.text, snippet.ranges)

    return (
        <Typography
            variant='bodySmall'
            numberOfLines={SNIPPET_LINES}
            opacity={0.8}
        >
            {parts.map((part, index) => (
                <Text
                    key={index}
                    style={part.match ? { color, fontFamily: FONTS.azeretMedium } : undefined}
                >
                    {part.text}
                </Text>
            ))}
        </Typography>
    )
}

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
        () => getSnippets(note.note || '', highlights, snippetLimit),
        [note.note, highlights, snippetLimit]
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
                        <Snippet
                            key={snippet.text}
                            snippet={snippet}
                            color={colors.accentText}
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
