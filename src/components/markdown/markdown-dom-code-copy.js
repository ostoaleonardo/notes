import {
    CODE_BLOCK_TEMPLATE,
    CODE_BLOCK_CLASS,
    CODE_COPY_BUTTON_CLASS,
    CODE_COPY_DONE_CLASS,
    CODE_COPY_ICON,
    CODE_COPIED_ICON,
    CODE_COPY_LABEL,
    CODE_COPY_RESET_MS
} from '@/constants/code-copy'

export const wrapCodeBlock = (preHtml) => CODE_BLOCK_TEMPLATE
    .replace('{blockClass}', CODE_BLOCK_CLASS)
    .replace('{buttonClass}', CODE_COPY_BUTTON_CLASS)
    .replace('{label}', CODE_COPY_LABEL)
    .replace('{icon}', CODE_COPY_ICON)
    .replace('{pre}', () => preHtml)

export const markCodeCopied = (button) => {
    button.classList.add(CODE_COPY_DONE_CLASS)
    button.innerHTML = CODE_COPIED_ICON

    setTimeout(() => {
        button.classList.remove(CODE_COPY_DONE_CLASS)
        button.innerHTML = CODE_COPY_ICON
    }, CODE_COPY_RESET_MS)
}
