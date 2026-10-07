import { DATE_KEY_LENGTH } from '@/constants/search-query'

export const toDateKey = (timestamp) => (
    timestamp ? new Date(timestamp).toISOString().slice(0, DATE_KEY_LENGTH) : null
)
