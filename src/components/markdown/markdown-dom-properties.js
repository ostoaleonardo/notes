import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { DomIcon } from './properties/dom-icon'
import { DraftRow } from './properties/draft-row'
import { PropertyRow } from './properties/property-row'
import { TagsRow } from './properties/tags-row'
import { ThemeContext } from './markdown-dom-theme-context'
import {
    buildPropertiesCardStyle,
    buildPropertiesToggleStyle,
    buildPropertyAddButtonStyle
} from './markdown-dom-panel-theme'

import {
    KEYBOARD_ARROW_DOWN_ICON_PATH,
    KEYBOARD_ARROW_UP_ICON_PATH,
    PLUS_ICON_PATH
} from '@/constants/icon-paths'
import { ICON_SIZE } from '@/constants/theme'
import { PROPERTY_TYPES } from '@/constants/properties'
import { TAG_PROPERTY_KEYS } from '@/constants/tags'

export const PropertiesPanel = ({
    tags = [],
    allTags = [],
    rows = [],
    suggestions = [],
    labels = {},
    propertiesLabel,
    visible,
    addRequest,
    onToggleVisible,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    onTagPress
}) => {
    const theme = useContext(ThemeContext)
    const { colors } = theme
    const { onBackground } = colors
    const [drafting, setDrafting] = useState(false)
    const [tagsAdded, setTagsAdded] = useState(false)
    const onAddTags = useCallback(() => setTagsAdded(true), [])
    const onCloseDraft = useCallback(() => setDrafting(false), [])
    const onOpenDraft = useCallback(() => setDrafting(true), [])
    const visibleRef = useRef(visible)
    const lastRequestRef = useRef(addRequest)

    visibleRef.current = visible

    useEffect(() => {
        if (addRequest === lastRequestRef.current) return
        lastRequestRef.current = addRequest

        if (!visibleRef.current) onToggleVisible()
        setDrafting(true)
    }, [addRequest, onToggleVisible])

    if (tags.length === 0 && !tagsAdded && rows.length === 0 && !drafting) return null

    const keys = rows.map(({ key }) => key)
    const availableSuggestions = tagsAdded
        ? suggestions.filter(({ type }) => type !== PROPERTY_TYPES.TAGS)
        : suggestions

    return (
        <div>
            <div style={buildPropertiesToggleStyle(theme)} onClick={() => onToggleVisible()}>
                <DomIcon
                    path={visible ? KEYBOARD_ARROW_UP_ICON_PATH : KEYBOARD_ARROW_DOWN_ICON_PATH}
                    color={onBackground}
                />
                {propertiesLabel}
            </div>

            {visible && (
                <div style={buildPropertiesCardStyle(theme)}>
                    {(tags.length > 0 || tagsAdded) && (
                        <TagsRow
                            tags={tags}
                            allTags={allTags}
                            tagsKey={TAG_PROPERTY_KEYS[0]}
                            autoFocus={tags.length === 0}
                            onRemoveTag={onRemoveTag}
                            onAddTag={onAddTag}
                            onTagPress={onTagPress}
                        />
                    )}

                    {rows.map((row) => (
                        <PropertyRow
                            key={row.key}
                            row={row}
                            keys={keys}
                            labels={labels}
                            onChangeProperty={onChangeProperty}
                        />
                    ))}

                    {drafting && (
                        <DraftRow
                            keys={keys}
                            suggestions={availableSuggestions}
                            labels={labels}
                            onChangeProperty={onChangeProperty}
                            onAddTags={onAddTags}
                            onClose={onCloseDraft}
                        />
                    )}

                    {!drafting && (
                        <button
                            type='button'
                            onClick={onOpenDraft}
                            style={buildPropertyAddButtonStyle(theme)}
                        >
                            <DomIcon path={PLUS_ICON_PATH} size={ICON_SIZE.sm} color={onBackground} />
                            {labels.add}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
