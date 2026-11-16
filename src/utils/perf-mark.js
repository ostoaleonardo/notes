import { PERF_MARKS_ENABLED, PERF_MARK_PREFIX } from '@/constants/perf-marks'

export const perfMark = (name) => {
    if (PERF_MARKS_ENABLED) console.log(`${PERF_MARK_PREFIX} ${name}`)
}
