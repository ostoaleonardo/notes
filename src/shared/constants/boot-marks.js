export const BOOT_MARKS_ENABLED = process.env.EXPO_PUBLIC_PERF_MARKS === '1'
export const BOOT_MARK_PREFIX = '[boot]'

export const BOOT_MARKS = {
    LOAD_START: 'load-start',
    SNAPSHOT: 'snapshot',
    SNAPSHOT_SET: 'snapshot-set',
    SPLASH_HIDE: 'splash-hide',
    SCAN_DONE: 'scan-done',
    SNAPSHOT_WRITE: 'snapshot-write',
    INDEX_LIST: 'index-list',
    LOAD_END: 'load-end'
}
