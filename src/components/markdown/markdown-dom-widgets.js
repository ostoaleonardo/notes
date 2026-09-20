import { useEffect, useRef, useState } from 'react'

import {
    buildMetaLabelStyle,
    buildTitleSectionStyle,
    buildTitleTextareaStyle
} from './markdown-dom-theme'

const AutoGrowTitle = ({
    value,
    onChange,
    onBlur,
    placeholder,
    fontFamily,
    textColor
}) => {
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
            style={buildTitleTextareaStyle({ fontFamily, textColor })}
        />
    )
}

const MetaLabel = ({ label, textColor }) => {
    if (!label) return null

    return (
        <div style={buildMetaLabelStyle({ textColor })}>
            {label}
        </div>
    )
}

export const TitleSection = ({
    title,
    onTitleChange,
    onTitleBlur,
    titlePlaceholder,
    metaLabel,
    headingFontFamily,
    textColor
}) => {
    if (title === undefined) return null

    return (
        <div style={buildTitleSectionStyle()}>
            <AutoGrowTitle
                value={title}
                onChange={onTitleChange}
                onBlur={onTitleBlur}
                placeholder={titlePlaceholder}
                fontFamily={headingFontFamily}
                textColor={textColor}
            />
            <MetaLabel label={metaLabel} textColor={textColor} />
        </div>
    )
}
