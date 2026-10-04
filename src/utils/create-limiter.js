export const createLimiter = (max) => {
    let active = 0
    const queue = []

    const next = () => {
        if (active >= max || !queue.length) return

        active++
        const { task, resolve, reject } = queue.shift()

        task()
            .then(resolve, reject)
            .finally(() => {
                active--
                next()
            })
    }

    return (task) => new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject })
        next()
    })
}
