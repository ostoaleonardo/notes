import { useContext, useEffect, useRef, useState } from 'react'

import { ThemeContext } from './markdown-dom-theme-context'
import {
    buildChipStyle,
    buildPropertiesCardStyle,
    buildPropertiesToggleStyle,
    buildPropertyAddButtonStyle,
    buildPropertyEntryStyle,
    buildPropertyIconButtonStyle,
    buildPropertyInputStyle,
    buildPropertyMenuItemStyle,
    buildPropertyMenuStyle,
    buildPropertyNameStyle,
    buildPropertyValueStyle
} from './markdown-dom-theme'

import {
    CLOSE_ICON_PATH,
    KEYBOARD_ARROW_DOWN_ICON_PATH,
    KEYBOARD_ARROW_UP_ICON_PATH,
    PLUS_ICON_PATH
} from '@/constants/icon-paths'
import { ICON_FILL, ICON_SIZE, ICON_VIEW_BOX } from '@/constants/icon-size'
import {
    EDITABLE_PROPERTY_TYPES,
    PROPERTY_CHANGES,
    PROPERTY_INPUT_TYPES,
    PROPERTY_TYPES,
    PROPERTY_TYPE_ICON_PATHS
} from '@/constants/properties'
import { TAG_PROPERTY_KEYS } from '@/constants/tags'
import {
    formatPropertyValue,
    getDefaultPropertyValue,
    isValidPropertyName,
    parsePropertyValue
} from '@/utils/properties'
import { filterTagSuggestions } from '@/utils/tag-names'

const DomIcon = ({ path, size = ICON_SIZE.sm, color, style, onClick }) => (
    <svg
        width={size}
        height={size}
        viewBox={ICON_VIEW_BOX}
        fill={ICON_FILL}
        style={{ color, flexShrink: 0, ...style }}
        onClick={onClick}
    >
        <path d={path} />
    </svg>
)

const PropertyIcon = ({ path }) => {
    const theme = useContext(ThemeContext)
    const { colors } = theme

    return <DomIcon path={path} color={colors.onBackground} style={{ opacity: 0.6 }} />
}

const keepFocus = (event) => event.preventDefault()

const useSyncedText = (value) => {
    const hasFocusRef = useRef(false)
    const [text, setText] = useState(value)

    useEffect(() => {
        if (!hasFocusRef.current) setText(value)
    }, [value])

    return { text, setText, hasFocusRef }
}

const ValueInput = ({ type, value, placeholder, onCommit }) => {
    const theme = useContext(ThemeContext)
    const { text, setText, hasFocusRef } = useSyncedText(formatPropertyValue(type, value))

    return (
        <input
            type={PROPERTY_INPUT_TYPES[type] ?? 'text'}
            inputMode={type === PROPERTY_TYPES.NUMBER ? 'decimal' : 'text'}
            value={text}
            placeholder={placeholder}
            onFocus={() => { hasFocusRef.current = true }}
            onBlur={() => { hasFocusRef.current = false }}
            onChange={(event) => {
                setText(event.target.value)
                onCommit(parsePropertyValue(type, event.target.value))
            }}
            style={buildPropertyInputStyle(theme)}
        />
    )
}

const NameInput = ({ name, keys, autoFocus, placeholder, onSubmit, onDiscard }) => {
    const theme = useContext(ThemeContext)
    const { text, setText, hasFocusRef } = useSyncedText(name)

    const submit = () => {
        const trimmed = text.trim()

        if (trimmed === name) return onDiscard?.()
        if (!isValidPropertyName(keys, trimmed)) {
            setText(name)
            return onDiscard?.()
        }

        onSubmit(trimmed)
    }

    return (
        <input
            type='text'
            value={text}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onFocus={() => { hasFocusRef.current = true }}
            onBlur={() => {
                hasFocusRef.current = false
                submit()
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
            }}
            onChange={(event) => setText(event.target.value)}
            style={buildPropertyInputStyle(theme)}
        />
    )
}

const PropertyValue = ({ row, placeholder, onChange }) => {
    const theme = useContext(ThemeContext)
    const { colors } = theme

    if (row.type === PROPERTY_TYPES.CHECKBOX) {
        return (
            <input
                type='checkbox'
                checked={row.value}
                onChange={(event) => onChange(event.target.checked)}
                style={{ accentColor: colors.tertiary, width: 16, height: 16, margin: 0 }}
            />
        )
    }

    if (row.type === PROPERTY_TYPES.UNSUPPORTED) {
        return (
            <span
                style={buildPropertyInputStyle(theme, { opacity: 0.6 })}
            >
                {row.value}
            </span>
        )
    }

    return (
        <ValueInput
            type={row.type}
            value={row.value}
            placeholder={placeholder}
            onCommit={onChange}
        />
    )
}

const PropertyRow = ({ row, keys, labels, onChangeProperty }) => {
    const theme = useContext(ThemeContext)
    const { colors } = theme

    return (
        <div style={buildPropertyEntryStyle()}>
            <div style={buildPropertyNameStyle()}>
                <PropertyIcon path={PROPERTY_TYPE_ICON_PATHS[row.type] || PROPERTY_TYPE_ICON_PATHS[PROPERTY_TYPES.TEXT]} />
                <NameInput
                    name={row.key}
                    keys={keys}
                    onSubmit={(nextKey) => onChangeProperty({
                        action: PROPERTY_CHANGES.RENAME,
                        key: row.key,
                        nextKey
                    })}
                />
            </div>
            <div style={buildPropertyValueStyle()}>
                <PropertyValue
                    row={row}
                    placeholder={labels.valuePlaceholder}
                    onChange={(value) => onChangeProperty({
                        action: PROPERTY_CHANGES.SET,
                        key: row.key,
                        value
                    })}
                />
            </div>
            <button
                type='button'
                aria-label={labels.remove}
                onClick={() => onChangeProperty({ action: PROPERTY_CHANGES.REMOVE, key: row.key })}
                style={{
                    ...buildPropertyIconButtonStyle(theme, { opacity: 0.4 }),
                    alignSelf: 'center'
                }}
            >
                <DomIcon path={CLOSE_ICON_PATH} size={ICON_SIZE.compact} color={colors.onBackground} />
            </button>
        </div>
    )
}

const MenuItem = ({ iconPath, label, onSelect }) => {
    const theme = useContext(ThemeContext)

    return (
        <div
            onMouseDown={keepFocus}
            onClick={onSelect}
            style={buildPropertyMenuItemStyle(theme)}
        >
            <PropertyIcon path={iconPath} />
            {label}
        </div>
    )
}

const DraftRow = ({ keys, suggestions, labels, onChangeProperty, onAddTags, onClose }) => {
    const theme = useContext(ThemeContext)
    const [type, setType] = useState(PROPERTY_TYPES.TEXT)
    const [typeMenuOpen, setTypeMenuOpen] = useState(false)
    const [query, setQuery] = useState('')

    const normalizedQuery = query.trim().toLowerCase()
    const filtered = suggestions.filter(({ key }) => key.toLowerCase().includes(normalizedQuery))

    const create = (key, propertyType) => {
        onChangeProperty({
            action: PROPERTY_CHANGES.SET,
            key,
            value: getDefaultPropertyValue(propertyType, new Date())
        })
        onClose()
    }

    const pickSuggestion = ({ key, type: suggestionType }) => {
        if (suggestionType === PROPERTY_TYPES.TAGS) {
            onClose()
            onAddTags()
            return
        }

        create(key, suggestionType)
    }

    const submitName = (name) => {
        if (TAG_PROPERTY_KEYS.includes(name.toLowerCase())) {
            onClose()
            onAddTags()
            return
        }

        create(name, type)
    }

    return (
        <div style={buildPropertyEntryStyle()}>
            <div style={buildPropertyNameStyle({ fill: true })}>
                <button
                    type='button'
                    onMouseDown={keepFocus}
                    onClick={() => setTypeMenuOpen((open) => !open)}
                    style={buildPropertyIconButtonStyle(theme)}
                >
                    <PropertyIcon path={PROPERTY_TYPE_ICON_PATHS[type]} />
                </button>
                <DraftNameInput
                    keys={keys}
                    placeholder={labels.namePlaceholder}
                    onQueryChange={setQuery}
                    onSubmit={submitName}
                    onClose={onClose}
                />
            </div>

            {typeMenuOpen && (
                <div style={buildPropertyMenuStyle(theme)}>
                    {EDITABLE_PROPERTY_TYPES.map((item) => (
                        <MenuItem
                            key={item}
                            iconPath={PROPERTY_TYPE_ICON_PATHS[item]}
                            label={labels.types[item]}
                            onSelect={() => {
                                setType(item)
                                setTypeMenuOpen(false)
                            }}
                        />
                    ))}
                </div>
            )}

            {!typeMenuOpen && filtered.length > 0 && (
                <div
                    style={{
                        ...buildPropertyMenuStyle(theme),
                        left: 'auto',
                        right: 0
                    }}
                >
                    {filtered.map((suggestion) => (
                        <MenuItem
                            key={suggestion.key}
                            iconPath={PROPERTY_TYPE_ICON_PATHS[suggestion.type]}
                            label={suggestion.key}
                            onSelect={() => pickSuggestion(suggestion)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const DraftNameInput = ({ keys, placeholder, onQueryChange, onSubmit, onClose }) => {
    const theme = useContext(ThemeContext)
    const [text, setText] = useState('')

    const finish = () => {
        const trimmed = text.trim()

        if (!trimmed) return onClose()
        if (TAG_PROPERTY_KEYS.includes(trimmed.toLowerCase()) || isValidPropertyName(keys, trimmed)) {
            return onSubmit(trimmed)
        }

        onClose()
    }

    return (
        <input
            type='text'
            autoFocus
            value={text}
            placeholder={placeholder}
            onBlur={finish}
            onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
                if (event.key === 'Escape') onClose()
            }}
            onChange={(event) => {
                setText(event.target.value)
                onQueryChange(event.target.value)
            }}
            style={buildPropertyInputStyle(theme)}
        />
    )
}

const TagInput = ({ tags, allTags, autoFocus, onAddTag }) => {
    const theme = useContext(ThemeContext)
    const [text, setText] = useState('')
    const [focused, setFocused] = useState(false)

    const options = filterTagSuggestions(allTags, tags, text)

    const add = (name) => {
        onAddTag(name)
        setText('')
    }

    return (
        <div style={{ flex: 1, minWidth: '80px' }}>
            <input
                type='text'
                value={text}
                autoFocus={autoFocus}
                autoCapitalize='none'
                autoCorrect='off'
                onFocus={() => setFocused(true)}
                onBlur={() => {
                    setFocused(false)
                    setText('')
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && text.trim()) add(text)
                    if (event.key === 'Escape') event.currentTarget.blur()
                }}
                onChange={(event) => setText(event.target.value)}
                style={buildPropertyInputStyle(theme)}
            />

            {focused && options.length > 0 && (
                <div
                    style={{
                        ...buildPropertyMenuStyle(theme),
                        left: 'auto',
                        right: 0
                    }}
                >
                    {options.map((tag) => (
                        <MenuItem
                            key={tag}
                            iconPath={PROPERTY_TYPE_ICON_PATHS[PROPERTY_TYPES.TAGS]}
                            label={tag}
                            onSelect={() => add(tag)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const TagsRow = ({ tags, allTags, tagsKey, autoFocus, onRemoveTag, onAddTag, onTagPress }) => {
    const theme = useContext(ThemeContext)
    const { colors, typography } = theme
    const { tertiary } = colors

    return (
        <div style={buildPropertyEntryStyle()}>
            <div style={buildPropertyNameStyle()}>
                <PropertyIcon path={PROPERTY_TYPE_ICON_PATHS[PROPERTY_TYPES.TAGS]} />
                <span style={{ fontSize: '13px', fontFamily: typography.fontFamily }}>{tagsKey}</span>
            </div>
            <div style={buildPropertyValueStyle()}>
                {tags.map((tag) => (
                    <span key={tag} style={buildChipStyle(theme)}>
                        <span onClick={() => onTagPress(tag)}>{tag}</span>
                        <DomIcon
                            path={CLOSE_ICON_PATH}
                            size={ICON_SIZE.xs}
                            color={tertiary}
                            style={{ opacity: 0.7 }}
                            onClick={() => onRemoveTag(tag)}
                        />
                    </span>
                ))}
                <TagInput
                    tags={tags}
                    allTags={allTags}
                    autoFocus={autoFocus}
                    onAddTag={onAddTag}
                />
            </div>
        </div>
    )
}

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
                            onAddTags={() => setTagsAdded(true)}
                            onClose={() => setDrafting(false)}
                        />
                    )}

                    {!drafting && (
                        <button
                            type='button'
                            onClick={() => setDrafting(true)}
                            style={buildPropertyAddButtonStyle(theme)}
                        >
                            <DomIcon path={PLUS_ICON_PATH} size={ICON_SIZE.compact} color={onBackground} />
                            {labels.add}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
