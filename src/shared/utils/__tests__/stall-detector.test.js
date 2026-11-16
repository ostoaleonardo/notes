import { startStallDetector } from '../stall-detector'

const INTERVAL = 50
const THRESHOLD = 100

describe('stall detector', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    const start = (clock) => {
        const onStall = jest.fn()
        const stop = startStallDetector({
            intervalMs: INTERVAL,
            thresholdMs: THRESHOLD,
            onStall,
            now: () => clock.time
        })

        return { onStall, stop }
    }

    test('reports a tick that arrives later than the threshold', () => {
        const clock = { time: 0 }
        const { onStall, stop } = start(clock)

        clock.time = INTERVAL + 300
        jest.advanceTimersByTime(INTERVAL)

        expect(onStall).toHaveBeenCalledWith(300)
        stop()
    })

    test('stays silent while ticks arrive on time', () => {
        const clock = { time: 0 }
        const { onStall, stop } = start(clock)

        clock.time = INTERVAL + THRESHOLD - 1
        jest.advanceTimersByTime(INTERVAL)

        expect(onStall).not.toHaveBeenCalled()
        stop()
    })

    test('stops reporting after it is stopped', () => {
        const clock = { time: 0 }
        const { onStall, stop } = start(clock)

        stop()
        clock.time = 1000
        jest.advanceTimersByTime(INTERVAL * 3)

        expect(onStall).not.toHaveBeenCalled()
    })
})
