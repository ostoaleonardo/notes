import { useContext, useEffect, useRef, useState } from 'react'

import { PropertiesPanel } from './markdown-dom-properties'
import { ThemeContext } from './markdown-dom-theme-context'

import {
    buildInvalidPropertiesBannerStyle,
    buildInvalidPropertiesDescriptionStyle,
    buildInvalidPropertiesTitleStyle,
    buildMetaLabelStyle,
    buildTitleSectionStyle,
    buildTitleTextareaStyle
} from './markdown-dom-theme'

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
    propertiesPanel,
    onToggleProperties,
    addPropertyRequest,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    onTagPress,
    colors,
    typography
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
        <ThemeContext.Provider value={{ colors, typography }}>
            <div style={buildTitleSectionStyle()}>
                <AutoGrowTitle
                    value={title}
                    onChange={onTitleChange}
                    onBlur={onTitleBlur}
                    placeholder={titlePlaceholder}
                />
                <MetaLabel label={metaLabel} />
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
