import { createContext, useContext, useEffect, useRef, useState } from 'react'

import {
    buildAddChipStyle,
    buildChipStyle,
    buildInvalidPropertiesBannerStyle,
    buildInvalidPropertiesDescriptionStyle,
    buildInvalidPropertiesTitleStyle,
    buildMetaLabelStyle,
    buildPropertiesToggleStyle,
    buildPropertyRowStyle,
    buildTitleSectionStyle,
    buildTitleTextareaStyle
} from './markdown-dom-theme'

import {
    CLOSE_ICON_PATH,
    KEYBOARD_ARROW_DOWN_ICON_PATH,
    KEYBOARD_ARROW_UP_ICON_PATH,
    PLUS_ICON_PATH,
    TAG_ICON_PATH
} from '../../constants/icon-paths'

const ThemeContext = createContext({ colors: {}, typography: {} })

const AutoGrowTitle = ({ value, onChange, onBlur, placeholder }) => {
    const { colors, typography } = useContext(ThemeContext)
    const ref = useRef(null)
    const hasFocusRef = useRef(false)
    const [localValue, setLocalValue] = useState(value || '')

    useEffect(() => {
        if (hasFocusRef.current) return
        setLocalValue(value || '')
    }, [value])

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [localValue])

    return (
        <textarea
            rows={1}
            ref={ref}
            value={localValue}
            onFocus={() => { hasFocusRef.current = true }}
            onBlur={() => {
                hasFocusRef.current = false
                onBlur?.()
            }}
            onChange={(event) => {
                setLocalValue(event.target.value)
                onChange?.(event.target.value)
            }}
            placeholder={placeholder}
            style={buildTitleTextareaStyle({ fontFamily: typography.headingFontFamily, onBackground: colors.onBackground })}
        />
    )
}

const MetaLabel = ({ label }) => {
    const { colors, typography } = useContext(ThemeContext)

    if (!label) return null

    return (
        <div style={buildMetaLabelStyle({ fontFamily: typography.fontFamily, onBackground: colors.onBackground })}>
            {label}
        </div>
    )
}

const PropertiesPanel = ({
    tags,
    propertiesLabel,
    visible,
    onToggleVisible,
    onRemoveTag,
    onOpenTags,
    onTagPress
}) => {
    const { colors, typography } = useContext(ThemeContext)
    const { tertiary, onTertiary, onBackground } = colors

    if (!tags || tags.length === 0) return null

    return (
        <div>
            <div style={buildPropertiesToggleStyle({ onBackground })} onClick={() => onToggleVisible()}>
                <svg
                    width='16'
                    height='16'
                    viewBox='0 -960 960 960'
                    fill={onBackground}
                >
                    <path d={visible ? KEYBOARD_ARROW_UP_ICON_PATH : KEYBOARD_ARROW_DOWN_ICON_PATH} />
                </svg>
                {propertiesLabel}
            </div>

            {visible && (
                <div style={buildPropertyRowStyle({ onBackground })}>
                    <svg
                        width='14'
                        height='14'
                        viewBox='0 -960 960 960'
                        fill={onBackground}
                        style={{ opacity: 0.6 }}
                    >
                        <path d={TAG_ICON_PATH} />
                    </svg>
                    {tags.map((tag) => (
                        <span key={tag} style={buildChipStyle({ tertiary, onTertiary, fontFamily: typography.fontFamily })}>
                            <span onClick={() => onTagPress(tag)}>{tag}</span>
                            <svg
                                width='10'
                                height='10'
                                viewBox='0 -960 960 960'
                                fill={onTertiary}
                                style={{ opacity: 0.7 }}
                                onClick={() => onRemoveTag(tag)}
                            >
                                <path d={CLOSE_ICON_PATH} />
                            </svg>
                        </span>
                    ))}
                    <span
                        onClick={() => onOpenTags()}
                        style={buildAddChipStyle({ tertiary, onTertiary })}
                    >
                        <svg
                            width='10'
                            height='10'
                            viewBox='0 -960 960 960'
                            fill={onTertiary}
                        >
                            <path d={PLUS_ICON_PATH} />
                        </svg>
                    </span>
                </div>
            )}
        </div>
    )
}

const InvalidPropertiesBanner = ({ title, description }) => {
    const { colors, typography } = useContext(ThemeContext)

    return (
        <div style={buildInvalidPropertiesBannerStyle({
            errorContainer: colors.errorContainer,
            onErrorContainer: colors.onErrorContainer,
            fontFamily: typography.fontFamily
        })}
        >
            <div style={buildInvalidPropertiesTitleStyle()}>{title}</div>
            <div style={buildInvalidPropertiesDescriptionStyle()}>{description}</div>
        </div>
    )
}

export const TitleSection = ({
    title,
    onTitleChange,
    onTitleBlur,
    titlePlaceholder,
    metaLabel,
    tags,
    propertiesLabel,
    propertiesVisible,
    onToggleProperties,
    onRemoveTag,
    onOpenTags,
    onTagPress,
    invalidProperties,
    invalidPropertiesTitle,
    invalidPropertiesDescription,
    colors,
    typography
}) => {
    if (title === undefined) return null

    return (
        <ThemeContext.Provider value={{ colors, typography }}>
            <div style={buildTitleSectionStyle()}>
                <AutoGrowTitle
                    value={title}
                    onChange={onTitleChange}
                    onBlur={onTitleBlur}
                    placeholder={titlePlaceholder}
                />
                <MetaLabel label={metaLabel} />
                {invalidProperties ? (
                    <InvalidPropertiesBanner
                        title={invalidPropertiesTitle}
                        description={invalidPropertiesDescription}
                    />
                ) : (
                    <PropertiesPanel
                        tags={tags}
                        propertiesLabel={propertiesLabel}
                        visible={propertiesVisible}
                        onToggleVisible={onToggleProperties}
                        onRemoveTag={onRemoveTag}
                        onOpenTags={onOpenTags}
                        onTagPress={onTagPress}
                    />
                )}
            </div>
        </ThemeContext.Provider>
    )
}
