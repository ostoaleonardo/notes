export const startStallDetector = ({ intervalMs, thresholdMs, onStall, now = Date.now }) => {
    let last = now()

    const timer = setInterval(() => {
        const current = now()
        const stalled = current - last - intervalMs

        if (stalled >= thresholdMs) onStall(stalled)

        last = current
    }, intervalMs)

    return () => clearInterval(timer)
}
