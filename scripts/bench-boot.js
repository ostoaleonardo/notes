const { execFileSync } = require('child_process')
const fs = require('fs')

const PACKAGE = process.env.PACKAGE || 'com.monospace.notes'
const RUNS = Number(process.env.RUNS || 5)
const WAIT_SECONDS = Number(process.env.WAIT || 14)
const DEVICE = process.env.DEVICE
const OUT = process.env.OUT
const ACTIVITY = `${PACKAGE}/.MainActivity`
const BOOT_PATTERN = /'\[boot\]', '([\w-]+)', (\d+), '(.*)'/
const EPOCH_PATTERN = /^\s*([\d.]+)\s/
const REPORTED_MARKS = [
    'load-start',
    'snapshot',
    'snapshot-set',
    'splash-hide',
    'scan-done',
    'snapshot-write',
    'index-list',
    'index-sync',
    'load-end'
]
const DETAIL_MARKS = ['snapshot', 'snapshot-write', 'index-list', 'index-sync']

const adb = (...args) => execFileSync('adb', DEVICE ? ['-s', DEVICE, ...args] : args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
})

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    return sorted[Math.floor((sorted.length - 1) / 2)]
}

const parseRun = (log) => {
    let start = null
    let main = null
    const marks = {}
    const details = {}

    for (const line of log.split('\n')) {
        const epoch = line.match(EPOCH_PATTERN)
        if (!epoch) continue

        const time = Number(epoch[1]) * 1000
        if (start === null && line.includes('START u0')) start = time
        if (main === null && line.includes('Running "main"')) main = time

        const mark = line.match(BOOT_PATTERN)
        if (mark && !(mark[1] in marks)) {
            marks[mark[1]] = Number(mark[2])
            details[mark[1]] = JSON.parse(mark[3] || '{}')
        }
    }

    if (start === null || main === null) return null

    const offsets = Object.fromEntries(Object.entries(marks).map(([name, time]) => [name, time - start]))

    return { offsets: { main: main - start, ...offsets }, details }
}

const measure = async () => {
    adb('logcat', '-c')
    adb('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP')
    adb('shell', 'am', 'force-stop', PACKAGE)
    await sleep(2)
    adb('shell', 'am', 'start', '-n', ACTIVITY)
    await sleep(WAIT_SECONDS)

    return parseRun(adb('logcat', '-d', '-v', 'epoch', 'ActivityTaskManager:I', 'ReactNativeJS:V', '*:S'))
}

const main = async () => {
    const runs = []

    for (let index = 0; index < RUNS; index += 1) {
        const run = await measure()
        if (run) runs.push(run)
    }

    if (!runs.length) {
        console.log('no valid runs: build the app with EXPO_PUBLIC_PERF_MARKS=1 and keep the screen unlocked')
        return
    }

    const summary = {}

    for (const name of ['main', ...REPORTED_MARKS]) {
        const values = runs.map((run) => run.offsets[name]).filter((value) => value !== undefined)
        if (!values.length) continue

        summary[name] = { median: Math.round(median(values)), runs: values.map(Math.round) }
        console.log(`${name.padEnd(15)} median ${String(summary[name].median).padStart(6)} ms  runs ${summary[name].runs}`)
    }

    const details = {}

    for (const name of DETAIL_MARKS) {
        const run = runs.find((candidate) => candidate.details[name])
        if (!run) continue

        details[name] = run.details[name]
        console.log(`${name} ${JSON.stringify(run.details[name])}`)
    }

    if (OUT) fs.writeFileSync(OUT, `${JSON.stringify({ summary, details }, null, 2)}\n`)
}

main()
