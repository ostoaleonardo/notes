import { FREE_ACCENT } from '@/constants/themes'

export const isAccentAllowed = (accent, pro) => (
    pro || accent === FREE_ACCENT
)

export const toggleAccentSelection = (color, accent) => (
    accent === color ? FREE_ACCENT : color
)

export const revertAccentOnProRevoke = (wasPro, isPro, accent) => (
    wasPro && !isPro && accent !== FREE_ACCENT ? FREE_ACCENT : accent
)
