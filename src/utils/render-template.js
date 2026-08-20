export const TEMPLATE_PLACEHOLDERS = ['date', 'time', 'title']

export const renderTemplate = (content, { title, language } = {}) => {
    const now = new Date()

    const values = {
        date: now.toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }),
        title: title || ''
    }

    return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (
        key in values ? values[key] : match
    ))
}
