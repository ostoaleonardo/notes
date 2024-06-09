export const getFormattedDate = (timestamp, language) => {
    const date = new Date(timestamp)

    return date.toLocaleDateString(language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })
}
