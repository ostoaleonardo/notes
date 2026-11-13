import { getBundledWelcome } from '@/utils/bundled-content'

import { TITLE_LINE_PATTERN } from '@/constants/bundled-content'

export const getWelcomeNote = () => {
    const text = getBundledWelcome() || ''
    const match = TITLE_LINE_PATTERN.exec(text)

    return {
        title: match ? match[1] : '',
        content: match ? text.slice(match[0].length) : text
    }
}
