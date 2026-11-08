export const toGridRows = (data, columns) => Array.from(
    { length: Math.ceil(data.length / columns) },
    (_, index) => data.slice(index * columns, (index + 1) * columns)
)

export const getGridFillers = (row, columns) => Array.from(
    { length: columns - row.length },
    (_, index) => index
)
