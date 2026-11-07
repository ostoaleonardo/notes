import { memo, useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { LoadingOverlay } from '@/ui/layout'

import RawMarkdownDomEditor from './markdown-dom-editor'

import { MissingNoteDialog } from '@/components/missing-note-dialog'

import { loadDomFonts } from '@/hooks/use-dom-fonts'
import { loadKatexFonts } from '@/hooks/use-katex-fonts'
import { useTags } from '@/hooks/use-tags'
import { useStableCallback } from '@/hooks/use-stable-callback'
import { useStableValue } from '@/hooks/use-stable-value'
import { useBlockIdCreator } from '@/hooks/use-block-id-creator'
import { useDomValue } from '@/hooks/use-dom-value'
import { useEditorLinkHandlers } from '@/hooks/use-editor-link-handlers'
import { useEditorPreview } from '@/hooks/use-editor-preview'
import { useEditorTheme } from '@/hooks/use-editor-theme'
import { useNoteEntries } from '@/hooks/use-note-entries'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { toggleTask } from '@/utils/tasks'
import { buildTableLabels } from '@/utils/table-labels'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { MATH_DELIMITER } from '@/constants/markdown-math'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { WIKI_LINK_FORMATS } from '@/constants/wiki-links'

const MarkdownDomEditor = memo(RawMarkdownDomEditor)

export const MarkdownInput = ({
    id,
    mode = EDITOR_MODES.LIVE,
    onEdit,
    value,
    onChangeText,
    onHistoryChange,
    action,
    onFocus,
    onBlur,
    placeholder,
    titleField,
    onTitleChange,
    onTitleBlur,
    propertiesPanel,
    onToggleProperties,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    onTagPress,
    search,
    anchor,
    onJumpToAnchor,
    headingIndex,
    jumpNonce,
    showBacklinks = true
}) => {
    const { t } = useTranslation()
    const { tags: knownTags } = useTags()

    const hasMath = useMemo(() => !!value && value.includes(MATH_DELIMITER), [value])

    const [linkFormat, setLinkFormat] = useState(WIKI_LINK_FORMATS.WIKILINK)
    const [ready, setReady] = useState(false)
    const onReady = useCallback(() => setReady(true), [])

    useStorageEffect(STORAGE_KEYS.LINK_FORMAT, (value) => {
        if (value === WIKI_LINK_FORMATS.MARKDOWN) setLinkFormat(WIKI_LINK_FORMATS.MARKDOWN)
    })

    const allNoteEntries = useNoteEntries()
    const noteEntries = useMemo(() => allNoteEntries.map((entry) => (
        entry.id === id ? { ...entry, unlabeled: [] } : entry
    )), [allNoteEntries, id])
    const onCreateBlockId = useBlockIdCreator()

    const { previewValue, mediaMapEntries, backlinksHtml } = useEditorPreview({ id, mode, value, showBacklinks })
    const { onLinkPress, onImagePress, missingNote } = useEditorLinkHandlers({ id, onTagPress, onJumpToAnchor })

    const onToggleTask = useCallback((index) => {
        onChangeText(toggleTask(value, index))
    }, [value, onChangeText])

    const tableLabels = useMemo(() => buildTableLabels(t), [t])

    const dom = useMemo(() => ({
        scrollEnabled: mode === EDITOR_MODES.READ,
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        androidLayerType: 'software',
        style: { flex: 1 }
    }), [mode])

    const { theme, display } = useEditorTheme()
    const { domValue, valueNonce, onDomChange } = useDomValue(value, onChangeText)

    const stableNoteEntries = useStableValue(noteEntries)
    const stableKnownTags = useStableValue(knownTags)
    const stableTitleField = useStableValue(titleField)
    const stablePropertiesPanel = useStableValue(propertiesPanel)
    const stableOnTitleBlur = useStableCallback(onTitleBlur)

    return (
        <>
            <View style={{ flex: 1 }}>
                <MarkdownDomEditor
                    mode={mode}
                    onEdit={onEdit}
                    value={domValue}
                    valueNonce={valueNonce}
                    previewValue={previewValue}
                    mediaMap={mediaMapEntries}
                    noteEntries={stableNoteEntries}
                    knownTags={stableKnownTags}
                    linkFormat={linkFormat}
                    tableLabels={tableLabels}
                    lineNumbers={display.lineNumbers}
                    spellcheck={display.spellcheck}
                    autocorrect={display.autocorrect}
                    tabSize={display.tabSize}
                    inlineTitle={display.inlineTitle}
                    backlinksHtml={backlinksHtml}
                    onChange={onDomChange}
                    onHistoryChange={onHistoryChange}
                    action={action}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onReady={onReady}
                    onLinkPress={onLinkPress}
                    onTagPress={onTagPress}
                    onCreateBlockId={onCreateBlockId}
                    onImagePress={onImagePress}
                    onToggleTask={onToggleTask}
                    placeholder={placeholder}
                    titleField={stableTitleField}
                    onTitleChange={onTitleChange}
                    onTitleBlur={stableOnTitleBlur}
                    propertiesPanel={stablePropertiesPanel}
                    onToggleProperties={onToggleProperties}
                    onChangeProperty={onChangeProperty}
                    onRemoveTag={onRemoveTag}
                    onAddTag={onAddTag}
                    search={search}
                    anchor={anchor}
                    headingIndex={headingIndex}
                    jumpNonce={jumpNonce}
                    theme={theme}
                    hasMath={hasMath}
                    loadFonts={loadDomFonts}
                    loadKatexFonts={loadKatexFonts}
                    dom={dom}
                />

                {!ready && <LoadingOverlay />}
            </View>

            <MissingNoteDialog
                missing={missingNote.missing}
                onDismiss={missingNote.dismiss}
                onConfirm={missingNote.create}
            />
        </>
    )
}
