import { useContext, useEffect, useRef, useState } from 'react'

import { PropertiesPanel } from './markdown-dom-properties'
import { ThemeContext } from './markdown-dom-theme-context'

import {
    buildInvalidPropertiesBannerStyle,
    buildInvalidPropertiesDescriptionStyle,
    buildInvalidPropertiesTitleStyle,
    buildMetaLabelStyle,
    buildMetaLineStyle,
    buildMetaTokenStyle,
    buildTitleSectionStyle,
    buildTitleTextareaStyle
} from './markdown-dom-panel-theme'

const AutoGrowTitle = ({ value, onChange, onBlur, placeholder }) => {
    const theme = useContext(ThemeContext)
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
            style={buildTitleTextareaStyle(theme)}
        />
    )
}

const MetaLines = ({ lines }) => {
    const theme = useContext(ThemeContext)

    if (!lines?.length) return null

    return (
        <div style={buildMetaLabelStyle(theme)}>
            {lines.map((line, lineIndex) => (
                <div key={lineIndex} style={buildMetaLineStyle()}>
                    {line.map((item, index) => (
                        <span key={index} style={buildMetaTokenStyle(theme, item.type)}>
                            {item.value}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    )
}

const InvalidPropertiesBanner = ({ title, description }) => {
    const theme = useContext(ThemeContext)

    return (
        <div style={buildInvalidPropertiesBannerStyle(theme)}>
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
    showTitle = true,
    metaLines,
    propertiesPanel,
    onToggleProperties,
    addPropertyRequest,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    onTagPress,
    theme
}) => {
    if (title === undefined) return null

    const {
        tags,
        allTags,
        rows,
        suggestions,
        labels,
        label,
        visible,
        invalid,
        invalidTitle,
        invalidDescription
    } = propertiesPanel || {}

    return (
        <ThemeContext.Provider value={theme}>
            <div style={buildTitleSectionStyle()}>
                {showTitle && (
                    <AutoGrowTitle
                        value={title}
                        onChange={onTitleChange}
                        onBlur={onTitleBlur}
                        placeholder={titlePlaceholder}
                    />
                )}
                <MetaLines lines={metaLines} />
                {invalid ? (
                    <InvalidPropertiesBanner
                        title={invalidTitle}
                        description={invalidDescription}
                    />
                ) : propertiesPanel && (
                    <PropertiesPanel
                        tags={tags}
                        allTags={allTags}
                        rows={rows}
                        suggestions={suggestions}
                        labels={labels}
                        propertiesLabel={label}
                        visible={visible}
                        addRequest={addPropertyRequest}
                        onToggleVisible={onToggleProperties}
                        onChangeProperty={onChangeProperty}
                        onRemoveTag={onRemoveTag}
                        onAddTag={onAddTag}
                        onTagPress={onTagPress}
                    />
                )}
            </div>
        </ThemeContext.Provider>
    )
}
