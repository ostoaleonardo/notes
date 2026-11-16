import RepositoryFs from 'repository-fs'

export const toRows = ({ columns, values }) => {
    const count = values[0]?.length ?? 0

    return Array.from({ length: count }, (_, row) => (
        Object.fromEntries(columns.map((name, column) => [name, values[column][row]]))
    ))
}

export const createIndexQuery = (fs) => async (sql, ...params) => toRows(await fs.queryIndex(sql, params))

export const queryIndex = createIndexQuery(RepositoryFs)
