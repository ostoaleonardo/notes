export const applyLineDelta = (text, delta) => {
    const lines = text.split('\n')
    let output = []
    let position = 0

    for (const { at, remove, insert } of delta) {
        output = output.concat(lines.slice(position, at), insert)
        position = at + remove
    }

    return output.concat(lines.slice(position)).join('\n')
}
