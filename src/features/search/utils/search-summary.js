import { SEARCH_SUMMARY_KEYS } from '@/features/search/constants/search-summary'

export const getSearchSummary = ({ showLoader, searching, partial, count }) => {
    const loader = showLoader || (searching && count === 0)

    if (loader) return { loader, key: SEARCH_SUMMARY_KEYS.LABEL }

    return { loader, key: partial ? SEARCH_SUMMARY_KEYS.PARTIAL : SEARCH_SUMMARY_KEYS.TOTAL }
}
