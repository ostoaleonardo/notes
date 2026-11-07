import { useMemo } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers as cmLineNumbers } from '@codemirror/view'
import { indentUnit } from '@codemirror/language'

import { buildEditorTheme } from './markdown-dom-theme'
import { liveFormatting, mediaMapFacet, tableLabelsFacet } from './live-formatting/live-formatting'
import { noteEntriesFacet, wikiLinkFormatFacet } from './wiki-link-completion'
import { knownTagsFacet } from './tag-completion'
import { useCompartment } from './use-compartment'
import { buildInvalidFrontmatterHighlight } from './markdown-dom-invalid-frontmatter'
import { buildPropertiesTrigger, frontmatterAutoClose } from './markdown-dom-frontmatter'
import { buildBlankPlaceholder } from './markdown-dom-placeholder'
import { useStableValue } from '@/hooks/use-stable-value'

import { EDITOR_MODES } from '@/constants/editor-modes'

export const useEditorCompartments = (viewRef, {
    mode,
    mediaMap,
    noteEntries,
    knownTags,
    linkFormat,
    tableLabels,
    lineNumbers,
    spellcheck,
    autocorrect,
    tabSize,
    placeholder,
    stableTheme,
    onAddPropertyRef
}) => {
    const { colors } = stableTheme

    const stableMediaMap = useStableValue(mediaMap)
    const stableNoteEntries = useStableValue(noteEntries)
    const stableKnownTags = useStableValue(knownTags)
    const stableTableLabels = useStableValue(tableLabels)

    const mediaMapValue = useMemo(() => new Map(stableMediaMap || []), [stableMediaMap])

    const mediaMapExtension = useCompartment(viewRef, () => mediaMapFacet.of(mediaMapValue), [mediaMapValue])
    const noteEntriesExtension = useCompartment(viewRef, () => noteEntriesFacet.of(stableNoteEntries || []), [stableNoteEntries])
    const knownTagsExtension = useCompartment(viewRef, () => knownTagsFacet.of(stableKnownTags || []), [stableKnownTags])
    const linkFormatExtension = useCompartment(viewRef, () => wikiLinkFormatFacet.of(linkFormat), [linkFormat])
    const tableLabelsExtension = useCompartment(viewRef, () => tableLabelsFacet.of(stableTableLabels || {}), [stableTableLabels])
    const lineNumbersExtension = useCompartment(
        viewRef,
        () => (mode === EDITOR_MODES.CODE && lineNumbers ? [cmLineNumbers()] : []),
        [mode, lineNumbers]
    )
    const spellcheckExtension = useCompartment(
        viewRef,
        () => EditorView.contentAttributes.of({
            spellcheck: String(spellcheck),
            autocorrect: autocorrect ? 'on' : 'off',
            autocapitalize: autocorrect ? 'sentences' : 'off'
        }),
        [spellcheck, autocorrect]
    )

    const indentExtension = useCompartment(
        viewRef,
        () => [indentUnit.of(' '.repeat(tabSize)), EditorState.tabSize.of(tabSize)],
        [tabSize]
    )

    const liveFormattingExtension = useCompartment(
        viewRef,
        () => (mode === EDITOR_MODES.LIVE ? [liveFormatting] : []),
        [mode]
    )

    const invalidFrontmatterExtension = useCompartment(
        viewRef,
        () => buildInvalidFrontmatterHighlight(colors.errorContainer),
        [colors.errorContainer]
    )

    const frontmatterExtension = useCompartment(
        viewRef,
        () => (mode === EDITOR_MODES.CODE ? frontmatterAutoClose : buildPropertiesTrigger(onAddPropertyRef)),
        [mode]
    )

    const themeExtension = useCompartment(
        viewRef,
        () => buildEditorTheme(stableTheme),
        [stableTheme]
    )

    const bottomInset = stableTheme.layout?.bottomInset ?? 0

    const scrollMarginsExtension = useCompartment(
        viewRef,
        () => EditorView.scrollMargins.of(() => ({ bottom: bottomInset })),
        [bottomInset]
    )

    const placeholderCompartment = useCompartment(
        viewRef,
        () => buildBlankPlaceholder(placeholder),
        [placeholder]
    )

    return [
        mediaMapExtension,
        noteEntriesExtension,
        knownTagsExtension,
        linkFormatExtension,
        tableLabelsExtension,
        liveFormattingExtension,
        lineNumbersExtension,
        spellcheckExtension,
        indentExtension,
        invalidFrontmatterExtension,
        frontmatterExtension,
        placeholderCompartment,
        scrollMarginsExtension,
        themeExtension
    ]
}
