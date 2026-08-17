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

    const onImage = (payload = {}) => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        // Replaces the current line with the new image
        const lineEnd = value.indexOf('\n', start)
        const currentLine = value.slice(lineStart, lineEnd)
        const { title, url } = payload
        const label = title && title.trim() !== '' ? title : currentLine
        const newLine = `![${label}](${url || 'url'})`

        // Replaces the current line with the new image
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`
        setValue(newText)
    }

    const onLink = (payload = {}) => {
        // Gets the start of the current line
        const { start } = selection
        const lineStart = value.lastIndexOf('\n', start) + 1

        // Replaces the current line with the new link
        const lineEnd = value.indexOf('\n', start)
        const currentLine = value.slice(lineStart, lineEnd)
        const { title, url } = payload
        const label = title && title.trim() !== '' ? title : currentLine
        const newLine = `[${label}](${url || 'url'})`

        // Replaces the current line with the new link
        const newText = `${value.slice(0, lineStart)}${newLine}${value.slice(lineStart + currentLine.length)}`
        setValue(newText)
    }

    const onTable = (payload = {}) => {
        const { rows = 2, cols = 2 } = payload

        // Builds a table with the chosen amount of columns and data rows,
        // sizing the separator and empty cells to match each header's width
        const labels = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`)
        const headerCells = labels.map((label) => ` ${label} `).join('|')
        const separatorCells = labels.map((label) => '-'.repeat(label.length + 2)).join('|')
        const rowCells = labels.map((label) => ' '.repeat(label.length + 2)).join('|')

        const tableHeaders = `|${headerCells}|\n`
        const tableSeparator = `|${separatorCells}|\n`
        const tableRow = `|${rowCells}|\n`

        const table = `${tableHeaders}${tableSeparator}${tableRow.repeat(rows)}`

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
    const onFormatH5 = () => onHeading(5)
    const onFormatH6 = () => onHeading(6)

    return {
        onSelectionChange,
        onBold,
        onItalic,
        onStrikethrough,
        onCode,
        onFormatH1,
        onFormatH2,
        onFormatH3,
        onFormatH4,
        onFormatH5,
        onFormatH6,
        onQuote,
        onHorizontalRule,
        onImage,
        onLink,
        onTable
    }
}
