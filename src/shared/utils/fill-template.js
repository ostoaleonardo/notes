import { TEMPLATE_FILL_PATTERN } from '@/shared/constants/template-fill'

export const fillTemplate = (template, values) => template.replace(
    TEMPLATE_FILL_PATTERN,
    (match, key) => (key in values ? values[key] : match)
)
