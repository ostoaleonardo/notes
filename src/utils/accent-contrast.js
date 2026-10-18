import { ACCENT_TEXT_CONTRAST } from '@/constants/accent-contrast'

const channels = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16))

const toHex = (values) => `#${values.map((value) => (
    Math.round(value).toString(16).padStart(2, '0')
)).join('')}`

const linearize = (value) => {
    const channel = value / 255

    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

const luminance = (hex) => {
    const [red, green, blue] = channels(hex).map(linearize)

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export const mixColors = (foreground, background, amount) => {
    const front = channels(foreground)
    const back = channels(background)

    return toHex(front.map((value, index) => value * amount + back[index] * (1 - amount)))
}

export const contrastRatio = (first, second) => {
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)

    return (lighter + 0.05) / (darker + 0.05)
}

const readableOnAll = (color, surfaces, target) => (
    surfaces.every((surface) => contrastRatio(color, surface) >= target)
)

export const getReadableAccent = ({
    accent,
    surfaces,
    toward,
    target = ACCENT_TEXT_CONTRAST.target,
    tint = ACCENT_TEXT_CONTRAST.tint,
    step = ACCENT_TEXT_CONTRAST.step
}) => {
    const reference = surfaces.flatMap((surface) => [surface, mixColors(accent, surface, tint)])

    for (let amount = 0; amount <= 1; amount += step) {
        const candidate = mixColors(toward, accent, amount)

        if (readableOnAll(candidate, reference, target)) return candidate
    }

    return toward
}
