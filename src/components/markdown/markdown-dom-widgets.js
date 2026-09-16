import { useEffect, useRef } from 'react'

import {
    buildMetaLabelStyle,
    buildTitleSectionStyle,
    buildTitleTextareaStyle
} from './markdown-dom-theme'

const AutoGrowTitle = ({
    value,
    onChange,
    placeholder,
    fontFamily,
    textColor
}) => {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [value])

    return (
        <textarea
            rows={1}
            ref={ref}
            value={value || ''}
            onChange={(event) => onChange?.(event.target.value)}
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
                placeholder={titlePlaceholder}
                fontFamily={headingFontFamily}
                textColor={textColor}
            />
            <MetaLabel label={metaLabel} textColor={textColor} />
        </div>
    )
}
