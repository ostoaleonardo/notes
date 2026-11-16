import { getBundledTemplates } from '@/shared/utils/bundled-content'

import { DEFAULT_TEMPLATE_FILES } from '@/shared/constants/default-templates'

export const getDefaultTemplates = () => {
    const templates = getBundledTemplates()

    return Object.entries(DEFAULT_TEMPLATE_FILES)
        .filter(([key]) => templates[key.toLowerCase()])
        .map(([key, filename]) => ({
            filename, content: templates[key.toLowerCase()]
        }))
}
