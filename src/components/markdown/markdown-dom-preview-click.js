import { EMBED_CLASS } from '@/constants/embeds'
import { PREVIEW_CLICK_TYPES } from '@/constants/preview-click'
import { TASK_CHECKBOX_SELECTOR } from '@/constants/tasks'

export const resolvePreviewClick = (target, container) => {
    const link = target.closest('a')
    if (link) return { type: PREVIEW_CLICK_TYPES.LINK, url: link.getAttribute('href') }

    const image = target.closest('img')
    if (image) return { type: PREVIEW_CLICK_TYPES.IMAGE, url: image.getAttribute('src') }

    if (!target.matches(TASK_CHECKBOX_SELECTOR)) return null

    const index = [...container.querySelectorAll(TASK_CHECKBOX_SELECTOR)]
        .filter((checkbox) => !checkbox.closest(`.${EMBED_CLASS}`))
        .indexOf(target)

    return index === -1
        ? { type: PREVIEW_CLICK_TYPES.BLOCKED_TASK }
        : { type: PREVIEW_CLICK_TYPES.TASK, index }
}
