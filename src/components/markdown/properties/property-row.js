import { useContext } from 'react'

import { DomIcon, PropertyIcon } from './dom-icon'
import { useSyncedText } from './use-synced-text'
import { ThemeContext } from '@/components/markdown/markdown-dom-theme-context'
import {
    buildPropertyEntryStyle,
    buildPropertyIconButtonStyle,
    buildPropertyInputStyle,
    buildPropertyNameStyle,
    buildPropertyValueStyle
} from '@/components/markdown/markdown-dom-panel-theme'

import { CLOSE_ICON_PATH } from '@/constants/icon-paths'
import { ICON_SIZE, OPACITY } from '@/constants/theme'
import {
    PROPERTY_CHANGES,
    PROPERTY_INPUT_TYPES,
    PROPERTY_TYPES,
    PROPERTY_TYPE_ICON_PATHS
} from '@/constants/properties'
import { KEYBOARD_KEYS } from '@/constants/keyboard-keys'
import {
    formatPropertyValue,
    isValidPropertyName,
    parsePropertyValue
} from '@/utils/properties'

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
                if (event.key === KEYBOARD_KEYS.ENTER) event.currentTarget.blur()
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
                style={{ accentColor: colors.tertiary, width: ICON_SIZE.md, height: ICON_SIZE.md, margin: 0 }}
            />
        )
    }

    if (row.type === PROPERTY_TYPES.UNSUPPORTED) {
        return (
            <span
                style={buildPropertyInputStyle(theme, { opacity: OPACITY.secondary })}
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

export const PropertyRow = ({ row, keys, labels, onChangeProperty }) => {
    const theme = useContext(ThemeContext)
    const { colors } = theme

    return (
        <div style={buildPropertyEntryStyle()}>
            <div style={buildPropertyNameStyle()}>
                <PropertyIcon
                    path={PROPERTY_TYPE_ICON_PATHS[row.type] || PROPERTY_TYPE_ICON_PATHS[PROPERTY_TYPES.TEXT]}
                />
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
                    ...buildPropertyIconButtonStyle(theme, { opacity: OPACITY.disabled }),
                    alignSelf: 'center'
                }}
            >
                <DomIcon path={CLOSE_ICON_PATH} size={ICON_SIZE.sm} color={colors.onBackground} />
            </button>
        </div>
    )
}
