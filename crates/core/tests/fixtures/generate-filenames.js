const fs = require('fs')
const path = require('path')

const TITLES = [
    'Meeting notes', 'Grocery list', 'Año Nuevo', 'Café con leche', 'x y z', 'Untitled', '',
    '   padded   ', 'a/b', 'a\\b', 'a:b', 'a*b', 'a?b', 'a"b', 'a<b>c', 'a|b', 'tab\there',
    'new\nline', '日本語のノート', '🙂 emoji', 'ñandú', 'Ünïcode', 'Dots.in.middle', '.hidden',
    'many   spaces', 'ends with dash-', '100% sure #1', 'a+b=c&d', "it's", '(parens)', '[brackets]',
    'under_score', 'UPPER', 'MiXeD', '1234567890', 'x'.repeat(150), 'ñ'.repeat(100),
    'Plan: Q1/Q2', 'What? Why!', 'C:\\path\\file', '<tag>', 'a'.repeat(200)
]

test('generates filename fixtures', () => {
    const { sanitizeFilename } = require('@/shared/utils/note-filename')

    const cases = TITLES.map((title) => ({ title, filename: sanitizeFilename(title) }))

    fs.writeFileSync(
        path.join(__dirname, 'filenames.json'),
        `${JSON.stringify(cases, null, 2)}\n`
    )
})
