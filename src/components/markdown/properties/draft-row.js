import { useContext, useState } from 'react'

import { PropertyIcon } from './dom-icon'
import { PropertyMenuItem } from './property-menu-item'
import { ThemeContext } from '@/components/markdown/markdown-dom-theme-context'
import {
    buildPropertyEntryStyle,
    buildPropertyIconButtonStyle,
    buildPropertyInputStyle,
    buildPropertyMenuStyle,
    buildPropertyNameStyle
} from '@/components/markdown/markdown-dom-panel-theme'

import {
    EDITABLE_PROPERTY_TYPES,
    PROPERTY_CHANGES,
    PROPERTY_TYPES,
    PROPERTY_TYPE_ICON_PATHS
} from '@/constants/properties'
import { TAG_PROPERTY_KEYS } from '@/constants/tags'
import { KEYBOARD_KEYS } from '@/constants/keyboard-keys'
import { getDefaultPropertyValue, isValidPropertyName } from '@/utils/properties'
import { keepFocus } from '@/utils/keep-focus'

export const DraftRow = ({ keys, suggestions, labels, onChangeProperty, onAddTags, onClose }) => {
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
                        <PropertyMenuItem
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
                        <PropertyMenuItem
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
                if (event.key === KEYBOARD_KEYS.ENTER) event.currentTarget.blur()
                if (event.key === KEYBOARD_KEYS.ESCAPE) onClose()
            }}
            onChange={(event) => {
                setText(event.target.value)
                onQueryChange(event.target.value)
            }}
            style={buildPropertyInputStyle(theme)}
        />
    )
}
