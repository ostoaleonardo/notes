export const pushToMap = (map, key, value) => {
    const list = map.get(key)

    if (list) list.push(value)
    else map.set(key, [value])
}
