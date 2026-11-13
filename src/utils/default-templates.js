import { getBundledTemplates } from '@/utils/bundled-content'

import { DEFAULT_TEMPLATE_FILES } from '@/constants/default-templates'

export const getDefaultTemplates = () => {
    const templates = getBundledTemplates()

    return Object.entries(DEFAULT_TEMPLATE_FILES)
        .filter(([key]) => templates[key.toLowerCase()])
        .map(([key, filename]) => ({
            filename, content: templates[key.toLowerCase()]
        }))
}
