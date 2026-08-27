import { useEffect, useRef } from 'react'
import { buildDateLabelStyle, buildTitleSectionStyle, buildTitleTextareaStyle } from './markdown-dom-theme'

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
            ref={ref}
            value={value || ''}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            rows={1}
            style={buildTitleTextareaStyle({ fontFamily, textColor })}
        />
    )
}

const DateLabel = ({ label, textColor }) => {
    if (!label) return null

    return (
        <div style={buildDateLabelStyle({ textColor })}>
            {label}
        </div>
    )
}

export const TitleSection = ({
    title,
    onTitleChange,
    titlePlaceholder,
    dateLabel,
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
            <DateLabel label={dateLabel} textColor={textColor} />
        </div>
    )
}
