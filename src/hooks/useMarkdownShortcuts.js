export const useMarkdownShortcuts = (value, setValue, selection, setSelection) => {

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

    const onBold = () => onFormat('*')
    const onItalic = () => onFormat('_')
    const onStrikethrough = () => onFormat('~')
    const onCode = () => onFormat('`')

    const onHeading = (level) => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        // Gets the current line
        const heading = '#'.repeat(level)
        const currentLine = value.slice(lineStart, value.indexOf('\n', start))

        // Replaces the current line with the new heading
        const newLine = `${heading} ${currentLine}`
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`

        setValue(newText)
    }

    const onQuote = () => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1
        const lineEnd = value.indexOf('\n', start)

        // Gets the current line and replaces it with the new quote
        const currentLine = value.slice(lineStart, lineEnd)
        const newLine = '> ' + currentLine

        // Replaces the current line with the new quote
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`
        setValue(newText)
    }

    const onHorizontalRule = () => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        // Replaces the current line with the new horizontal
        const lineEnd = value.indexOf('\n', start)
        const currentLine = value.slice(lineStart, lineEnd)
        const newLine = '___'

        // If the current line is empty, add the horizontal rule
        // Otherwise, add a new line with the horizontal rule
        const newText = currentLine.trim() === ''
            ? `${value.slice(0, lineStart)}${newLine}${value.slice(lineEnd)}`
            : `${value.slice(0, lineEnd)}\n${newLine}${value.slice(lineEnd)}`

        setValue(newText)
    }

    const onImage = () => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        // Replaces the current line with the new image
        const lineEnd = value.indexOf('\n', start)
        const currentLine = value.slice(lineStart, lineEnd)
        const newLine = `![${currentLine}](url)`

        // Replaces the current line with the new image
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`
        setValue(newText)
    }

    const onLink = () => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        // Replaces the current line with the new link
        const lineEnd = value.indexOf('\n', start)
        const currentLine = value.slice(lineStart, lineEnd)
        const newLine = `[${currentLine}](url)`

        // Replaces the current line with the new link
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`
        setValue(newText)
    }

    const onTable = () => {
        // Constants
        const tableHeaders = '| Option | Description |\n'
        const tableSeparator = '| ------ | ----------- |\n'
        const tableRow = '| data   |      x      |\n'

        const table = `${tableHeaders}${tableSeparator}${tableRow}${tableRow}`

        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        const lineEnd = value.indexOf('\n', start)
        const currentLine = value.slice(lineStart, lineEnd)
        const newLine = table

        // Replaces the current line with the new table
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`
        setValue(newText)
    }

    const onFormatH1 = () => onHeading(1)
    const onFormatH2 = () => onHeading(2)
    const onFormatH3 = () => onHeading(3)
    const onFormatH4 = () => onHeading(4)

    return {
        onSelectionChange,
        onBold,
        onItalic,
        onStrikethrough,
        onCode,
        onFormatH1,
        onQuote
    }
}
