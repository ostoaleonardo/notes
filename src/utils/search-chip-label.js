import { SEARCH_CHIP_LABELS } from '@/constants/search-filters'

export const getChipLabelKey = (chip) => SEARCH_CHIP_LABELS[`${chip.group}:${chip.value ?? ''}`] ?? null

export const getChipText = (chip, t) => {
    const key = getChipLabelKey(chip)

    return key ? t(key) : chip.value ?? chip.label
}
