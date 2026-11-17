import { BOOT_MARKS_ENABLED, BOOT_MARK_PREFIX } from '@/shared/constants/boot-marks'

export const bootMark = (name, details = {}) => {
    if (BOOT_MARKS_ENABLED) console.log(BOOT_MARK_PREFIX, name, Date.now(), JSON.stringify(details))
}
