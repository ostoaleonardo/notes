const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const STYLE = 'sharp'
const WEIGHT = '100'
const XML_DIR = 'xml'
const SOURCES = [
    { dir: 'src/icons', exclude: [] },
    { dir: 'src/ui/icons', exclude: ['icon-svg'] }
]
const ALIASES = {
    forma_quote: 'format_quote',
    picture: 'image',
    keep_filled: 'keep'
}
const FILLED = ['keep_filled']
const COMPOSE_ICONS = [
    'add',
    'arrow-back',
    'arrow-downward',
    'arrow-forward',
    'arrow-upward',
    'calendar-today',
    'check',
    'close',
    'code',
    'collapse-all',
    'commit',
    'create-new-folder',
    'delete',
    'edit',
    'edit-note',
    'expand-all',
    'folder',
    'folder-delete',
    'folder-managed',
    'format-list-bulleted',
    'keep',
    'keep-filled',
    'link',
    'link-off',
    'menu',
    'more-vert',
    'note-stack',
    'notes',
    'open-in-new',
    'redo',
    'search',
    'shapes',
    'share',
    'shuffle',
    'sort-by-alpha',
    'undo',
    'upload-file',
    'attach-file',
    'collapse-content',
    'data-array',
    'forma-quote',
    'format-bold',
    'format-h1',
    'format-indent-decrease',
    'format-indent-increase',
    'format-italic',
    'format-strikethrough',
    'horizontal-rule',
    'checklist',
    'done-all',
    'picture',
    'tag',
    'tune',
    'match-case',
    'schedule',
    'title'
].map((name) => name.replace(/-/g, '_'))

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')
const write = (file, content) => fs.writeFileSync(path.join(ROOT, file), content)
const toSnake = (name) => name.replace(/-/g, '_')
const toMaterial = (snake) => ALIASES[snake] ?? snake

const download = (dir, names, fill) => {
    if (!names.length) return

    const flags = fill ? ['--fill'] : []

    execFileSync('npx', [
        '--yes',
        '@expo/material-symbols',
        '--style', STYLE,
        '--weight', WEIGHT,
        ...flags,
        '-o', path.join(ROOT, dir, XML_DIR),
        ...names
    ], { stdio: 'inherit' })
}

const xmlName = (material, fill) => (
    `${material}_${STYLE}${fill ? '_fill' : ''}_wght${WEIGHT}.xml`
)

const removeSource = (file) => {
    const content = read(file)
    const pattern = /\n*^\w+\.source = .*$\n?/m

    if (pattern.test(content)) write(file, `${content.replace(pattern, '').trimEnd()}\n`)
}

const updateComponent = (file, sourceFile) => {
    let content = read(file)

    if (!content.includes('IconSvg')) return

    const component = content.match(/export const (\w+) = /)[1]
    const sourceLine = `${component}.source = require('./${XML_DIR}/${sourceFile}')`
    const sourcePattern = new RegExp(`^${component}\\.source = .*$`, 'm')

    content = sourcePattern.test(content)
        ? content.replace(sourcePattern, sourceLine)
        : `${content.trimEnd()}\n\n${sourceLine}\n`

    write(file, content)
}

SOURCES.forEach(({ dir, exclude }) => {
    const names = fs.readdirSync(path.join(ROOT, dir))
        .filter((file) => file.endsWith('.js'))
        .map((file) => file.replace('.js', ''))
        .filter((name) => !exclude.includes(name))
        .map(toSnake)

    const used = names.filter((name) => COMPOSE_ICONS.includes(name))
    const unused = names.filter((name) => !COMPOSE_ICONS.includes(name))

    const outline = used.filter((name) => !FILLED.includes(name)).map(toMaterial)
    const filled = used.filter((name) => FILLED.includes(name)).map(toMaterial)

    fs.mkdirSync(path.join(ROOT, dir, XML_DIR), { recursive: true })
    download(dir, outline, false)
    download(dir, filled, true)

    unused.forEach((snake) => {
        const file = `${dir}/${snake.replace(/_/g, '-')}.js`

        removeSource(file)
        fs.rmSync(path.join(ROOT, dir, XML_DIR, xmlName(toMaterial(snake), false)), { force: true })
    })

    used.forEach((snake) => {
        const fill = FILLED.includes(snake)
        const sourceFile = xmlName(toMaterial(snake), fill)

        updateComponent(`${dir}/${snake.replace(/_/g, '-')}.js`, sourceFile)
    })
})
