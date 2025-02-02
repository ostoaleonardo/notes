import { useState } from 'react'

export const useMarkdownShortcuts = (value, setValue, selection, setSelection) => {
    // const [selection, setSelection] = useState({ start: 0, end: 0 })

    const onSelectionChange = ({ nativeEvent: { selection } }) => {
        setSelection(selection)
    }

    const onFormat = (chars) => {
        const { start, end } = selection
        const formatLength = chars.length

        if (start !== end) {
            // Checks if the selected text is already surrounded by formatting characters
            const selectedText = value.slice(start, end)
            const beforeSelection = value.slice(0, start)
            const afterSelection = value.slice(end)

            if (beforeSelection.endsWith(chars) && afterSelection.startsWith(chars)) {
                // Removes formatting characters around selected text
                const newText = `${beforeSelection.slice(0, -formatLength)}${selectedText}${afterSelection.slice(2)}`
                setValue(newText)

                setSelection({ start: start - formatLength, end: end - formatLength })
            } else {
                // If it's not surrounded by the formatting characters, then it surrounds them
                const newText = `${beforeSelection}${chars}${selectedText}${chars}${afterSelection}`
                setValue(newText)

                setSelection({ start: start + formatLength, end: end + formatLength })
            }
        } else {
            // Inserts formatting characters at the current cursor position
            const text = `${value.slice(0, start)}${chars + chars}${value.slice(start)}`
            setValue(text)

            // Place the cursor between the formatting characters
            setSelection({ start: start + formatLength, end: start + formatLength })
        }
    }

    const onBold = () => onFormat('**')
    const onItalic = () => onFormat('_')
    const onStrikethrough = () => onFormat('~~')

    return { onSelectionChange, onBold, onItalic, onStrikethrough }
}
