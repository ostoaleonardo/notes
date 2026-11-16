import { ICON_FILL, ICON_VIEW_BOX } from '@/constants/theme'

export const buildIconMaskUrl = (path) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEW_BOX}"><path d="${path}"/></svg>`

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export const buildIconMarkup = (path, size) =>
    `<svg viewBox="${ICON_VIEW_BOX}" width="${size}" height="${size}" fill="${ICON_FILL}">` +
    `<path d="${path}"/></svg>`
