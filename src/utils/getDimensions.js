export const getDimensions = (length) => {
    return length > 1
        ? (100 / (length > 2 ? 3 : length)) - 2
        : 100
}
