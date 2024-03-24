import { useLanguage } from '@/hooks'

export const getFormattedDate = (timestamp) => {
    const { currentLanguage } = useLanguage()
    const date = new Date(timestamp)

    return date.toLocaleDateString(currentLanguage, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })
}
