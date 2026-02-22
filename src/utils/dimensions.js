export const getDimensions = (length) => {
    return length > 1
        ? 99.5 / (length > 2 ? 3 : length)
        : 100
}
