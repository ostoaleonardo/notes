const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const SCAN_DIRS = ['src', 'app', 'jest']
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']
const SPECIFIER_PATTERN = /(?:from|import\(|require\(|jest\.mock\(|jest\.requireActual\(|jest\.requireMock\(|jest\.doMock\()\s*['"]([^'"]+)['"]/g

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full)
    return EXTENSIONS.includes(path.extname(entry.name)) ? [full] : []
})

const listFiles = () => SCAN_DIRS
    .map((dir) => path.join(ROOT, dir))
    .filter((dir) => fs.existsSync(dir))
    .flatMap(walk)

const resolveFile = (base) => {
    const candidates = [base, ...EXTENSIONS.map((ext) => base + ext), ...EXTENSIONS.map((ext) => path.join(base, `index${ext}`))]

    return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null
}

const resolveSpecifier = (specifier, fromFile) => {
    if (specifier.startsWith('@/')) return resolveFile(path.join(SRC, specifier.slice(2)))
    if (specifier.startsWith('.')) return resolveFile(path.resolve(path.dirname(fromFile), specifier))

    return null
}

const readImports = (file) => {
    const text = fs.readFileSync(file, 'utf8')

    return [...text.matchAll(SPECIFIER_PATTERN)].map((match) => ({ specifier: match[1], target: resolveSpecifier(match[1], file) }))
}

const buildGraph = () => {
    const importers = new Map()
    const imports = new Map()

    for (const file of listFiles()) {
        const targets = readImports(file).map((item) => item.target).filter(Boolean)
        imports.set(file, new Set(targets))
        targets.forEach((target) => {
            if (!importers.has(target)) importers.set(target, new Set())
            importers.get(target).add(file)
        })
    }

    return { importers, imports }
}

const GLOBAL_DIRS = ['ui', 'icons', 'i18n', 'translations', 'content', 'syntax', 'features'].map((dir) => path.join(SRC, dir) + path.sep)

const isGlobal = (file) => GLOBAL_DIRS.some((dir) => file.startsWith(dir))

const isTest = (file) => /__tests__|__fixtures__|__perf__|dom-tests/.test(file)

const exclusiveClosure = (seeds, graph) => {
    const members = new Set(seeds)
    let changed = true

    while (changed) {
        changed = false

        for (const member of [...members]) {
            for (const dependency of graph.imports.get(member) || []) {
                if (members.has(dependency) || !dependency.startsWith(SRC) || isTest(dependency) || isGlobal(dependency)) continue

                const users = [...(graph.importers.get(dependency) || [])].filter((user) => !isTest(user))
                if (users.length && users.every((user) => members.has(user))) {
                    members.add(dependency)
                    changed = true
                }
            }
        }
    }

    return members
}

const subjectOf = (testFile) => {
    const match = /^(.*)\/__tests__\/(.+)\.test\.(js|jsx|ts|tsx)$/.exec(testFile)

    return match ? resolveFile(path.join(match[1], match[2])) : null
}

const pruneShared = (members, graph, keep = new Set()) => {
    let changed = true

    while (changed) {
        changed = false

        for (const member of [...members]) {
            if (keep.has(member)) continue

            const outside = [...(graph.importers.get(member) || [])].filter((user) => !members.has(user) && !isTest(user))

            if (outside.length) {
                members.delete(member)
                changed = true
            }
        }
    }

    return members
}

const testsOf = (members, graph) => {
    const tests = new Set()

    for (const file of graph.imports.keys()) {
        const subject = subjectOf(file)

        if (subject && members.has(subject)) {
            tests.add(file)
            continue
        }

        const local = [...(graph.imports.get(file) || [])].filter((target) => target.startsWith(SRC) && !isTest(target))

        if (!subject && isTest(file) && !/__fixtures__/.test(file) && local.length && local.every((target) => members.has(target))) {
            tests.add(file)
        }
    }

    const owned = new Set([...members, ...tests])

    for (const file of graph.imports.keys()) {
        if (!/__fixtures__/.test(file) || owned.has(file)) continue

        const users = [...(graph.importers.get(file) || [])]
        if (users.length && users.every((user) => owned.has(user))) tests.add(file)
    }

    return tests
}

const toRel = (file) => path.relative(ROOT, file)

const destinationOf = (file, feature) => {
    const rel = path.relative(SRC, file)

    return path.join(SRC, 'features', feature, rel)
}

const analyze = (feature, seedPatterns) => {
    const graph = buildGraph()
    const files = [...graph.imports.keys()]
    const seeds = files.filter((file) => seedPatterns.some((pattern) => new RegExp(pattern).test(toRel(file))) && !isTest(file))
    const members = pruneShared(exclusiveClosure(seeds, graph), graph, new Set(seeds))
    const tests = testsOf(members, graph)
    const mapping = {}

    for (const file of [...members, ...tests]) mapping[toRel(file)] = toRel(destinationOf(file, feature))

    const shared = [...members].flatMap((member) => [...(graph.imports.get(member) || [])])
        .filter((dependency) => dependency.startsWith(SRC) && !members.has(dependency) && !isTest(dependency))

    return { mapping, seeds: seeds.map(toRel), shared: [...new Set(shared.map(toRel))].sort() }
}

const planRewrites = (mapping) => {
    const moved = new Map(Object.entries(mapping).map(([from, to]) => [path.join(ROOT, from), path.join(ROOT, to)]))
    const newPathOf = (file) => moved.get(file) || file
    const stripExt = (file) => file.replace(/\.(js|jsx|ts|tsx)$/, '').replace(/\/index$/, '')
    const writes = new Map()

    for (const file of listFiles()) {
        const finalFile = newPathOf(file)
        const original = fs.readFileSync(file, 'utf8')
        const next = original.replace(SPECIFIER_PATTERN, (whole, specifier) => {
            const target = resolveSpecifier(specifier, file)
            if (!target) return whole
            if (!moved.has(target) && finalFile === file) return whole

            const newTarget = newPathOf(target)

            if (specifier.startsWith('@/')) {
                return whole.replace(specifier, `@/${path.relative(SRC, stripExt(newTarget))}`)
            }

            let relative = path.relative(path.dirname(finalFile), stripExt(newTarget))
            if (!relative.startsWith('.')) relative = `./${relative}`

            return whole.replace(specifier, relative)
        })

        writes.set(finalFile, next)
    }

    return writes
}

const move = (mapping) => {
    const writes = planRewrites(mapping)

    for (const [from, to] of Object.entries(mapping)) {
        fs.mkdirSync(path.dirname(path.join(ROOT, to)), { recursive: true })
        execFileSync('git', ['mv', from, to], { cwd: ROOT })
    }

    for (const [file, content] of writes) fs.writeFileSync(file, content)
}

const featureRoot = (feature) => path.join(SRC, 'features', feature)

const evict = (feature) => {
    const graph = buildGraph()
    const root = featureRoot(feature)
    const inside = [...graph.imports.keys()].filter((file) => file.startsWith(root) && !isTest(file))
    const members = pruneShared(new Set(inside), graph)
    const mapping = {}

    for (const file of inside) {
        if (members.has(file)) continue

        const rel = path.relative(root, file)
        mapping[toRel(file)] = toRel(path.join(SRC, rel))
    }

    return mapping
}

const reachableFrom = (entry, graph) => {
    const seen = new Set()
    const stack = [entry]

    while (stack.length) {
        const current = stack.pop()
        if (seen.has(current)) continue

        seen.add(current)
        stack.push(...(graph.imports.get(current) || []))
    }

    return seen
}

const collapseEditorPath = (rel) => rel.replace(/^components\/markdown\//, '')

const splitRuntime = (feature, entryRel) => {
    const graph = buildGraph()
    const root = featureRoot(feature)
    const reachable = reachableFrom(path.join(ROOT, entryRel), graph)
    const inside = [...graph.imports.keys()].filter((file) => file.startsWith(root + path.sep))
    const classes = new Map()

    for (const file of inside.filter((item) => !isTest(item))) {
        if (!reachable.has(file)) {
            classes.set(file, 'native')
            continue
        }

        const usedByNative = [...(graph.importers.get(file) || [])].some((user) => !reachable.has(user) && !isTest(user))
        classes.set(file, usedByNative && file !== path.join(ROOT, entryRel) ? 'shared' : 'dom')
    }

    const classOfTest = (file) => {
        const subject = subjectOf(file)
        if (subject && classes.has(subject)) return classes.get(subject)

        const local = [...(graph.imports.get(file) || [])].filter((target) => classes.has(target))
        const kinds = new Set(local.map((target) => classes.get(target)))

        if (/dom-tests/.test(file)) return 'dom'
        if (kinds.size === 1) return [...kinds][0]

        return kinds.has('native') ? 'native' : 'dom'
    }

    const mapping = {}
    const used = new Map()

    for (const file of inside) {
        const kind = isTest(file) ? classOfTest(file) : classes.get(file)
        const rel = collapseEditorPath(path.relative(root, file))
        const target = path.join(root, kind, rel)

        if (used.has(target)) throw new Error(`collision: ${toRel(file)} and ${toRel(used.get(target))} -> ${toRel(target)}`)

        used.set(target, file)
        mapping[toRel(file)] = toRel(target)
    }

    return mapping
}

const [command, ...args] = process.argv.slice(2)

if (command === 'analyze') {
    const [feature, ...patterns] = args
    const result = analyze(feature, patterns)

    console.log(JSON.stringify(result, null, 2))
} else if (command === 'split-runtime') {
    console.log(JSON.stringify(splitRuntime(args[0], args[1]), null, 2))
} else if (command === 'evict') {
    console.log(JSON.stringify(evict(args[0]), null, 2))
} else if (command === 'move') {
    const mapping = JSON.parse(fs.readFileSync(args[0], 'utf8'))

    move(mapping)
    console.log(`moved ${Object.keys(mapping).length} files`)
} else {
    console.log('usage: feature-tool.js analyze <feature> <seed-regex...> | move <mapping.json>')
}
