import { useContext, useState } from 'react'

import { DomIcon, PropertyIcon } from './dom-icon'
import { PropertyMenuItem } from './property-menu-item'
import { ThemeContext } from '@/components/markdown/markdown-dom-theme-context'
import {
    buildChipStyle,
    buildPropertyEntryStyle,
    buildPropertyInputStyle,
    buildPropertyMenuStyle,
    buildPropertyNameStyle,
    buildPropertyValueStyle
} from '@/components/markdown/markdown-dom-panel-theme'

import { CLOSE_ICON_PATH } from '@/constants/icon-paths'
import { ICON_SIZE, OPACITY, DOM_FONT_SIZE } from '@/constants/theme'
import { PROPERTY_TYPES, PROPERTY_TYPE_ICON_PATHS } from '@/constants/properties'
import { KEYBOARD_KEYS } from '@/constants/keyboard-keys'
import { filterTagSuggestions } from '@/utils/tag-names'

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
                    if (event.key === KEYBOARD_KEYS.ENTER && text.trim()) add(text)
                    if (event.key === KEYBOARD_KEYS.ESCAPE) event.currentTarget.blur()
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
                        <PropertyMenuItem
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

export const TagsRow = ({ tags, allTags, tagsKey, autoFocus, onRemoveTag, onAddTag, onTagPress }) => {
    const theme = useContext(ThemeContext)
    const { colors, typography } = theme
    const { tertiary } = colors

    return (
        <div style={buildPropertyEntryStyle()}>
            <div style={buildPropertyNameStyle()}>
                <PropertyIcon path={PROPERTY_TYPE_ICON_PATHS[PROPERTY_TYPES.TAGS]} />
                <span style={{ fontSize: DOM_FONT_SIZE.small, fontFamily: typography.fontFamily }}>{tagsKey}</span>
            </div>
            <div style={buildPropertyValueStyle()}>
                {tags.map((tag) => (
                    <span key={tag} style={buildChipStyle(theme)}>
                        <span onClick={() => onTagPress(tag)}>{tag}</span>
                        <DomIcon
                            path={CLOSE_ICON_PATH}
                            size={ICON_SIZE.xs}
                            color={tertiary}
                            style={{ opacity: OPACITY.pressed }}
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
