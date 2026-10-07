import { TEMPLATE_VARIABLE_PATTERN } from '@/constants/template-placeholders'

export const renderTemplate = (content, { title, language } = {}) => {
    const now = new Date()

    const values = {
        date: now.toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }),
        title: title || ''
    }

    return content.replace(TEMPLATE_VARIABLE_PATTERN, (match, key) => (
        key in values ? values[key] : match
    ))
}
