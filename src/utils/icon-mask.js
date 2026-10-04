import { ICON_VIEW_BOX } from '@/constants/icon-size'

export const buildIconMaskUrl = (path) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEW_BOX}"><path d="${path}"/></svg>`

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
