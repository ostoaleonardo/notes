import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers as cmLineNumbers } from '@codemirror/view'
import { indentUnit } from '@codemirror/language'

import { buildEditorTheme } from './markdown-dom-theme'
import { buildEditorHighlighting } from './syntax-highlighting/syntax-highlight-style'
import { liveFormatting, tableLabelsFacet } from './live-formatting/live-formatting'
import { linkResolution } from './link-resolution'
import { mediaResolution } from './media-resolution'
import { wikiLinkFormatFacet } from './wiki-link-completion'
import { knownTagsFacet } from './tag-completion'
import { useCompartment } from './use-compartment'
import { buildInvalidFrontmatterHighlight } from './markdown-dom-invalid-frontmatter'
import { buildPropertiesTrigger, frontmatterAutoClose } from './markdown-dom-frontmatter'
import { buildBlankPlaceholder } from './markdown-dom-placeholder'
import { useStableValue } from '@/features/editor/shared/hooks/use-stable-value'

import { EDITOR_MODES } from '@/shared/constants/editor-modes'

export const useEditorCompartments = (viewRef, {
    mode,
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

    const stableKnownTags = useStableValue(knownTags)
    const stableTableLabels = useStableValue(tableLabels)

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
        () => (mode === EDITOR_MODES.LIVE ? [liveFormatting, linkResolution, mediaResolution] : []),
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

    const highlightingExtension = useCompartment(
        viewRef,
        () => buildEditorHighlighting(stableTheme),
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
        themeExtension,
        highlightingExtension
    ]
}
