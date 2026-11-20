const SECTION = [
    '## Section {i}',
    '',
    'Paragraph with **bold**, *italic*, `code`, ==highlight== and a [link](https://example.com/{i}).',
    'See [[Note {j}]] and [[Note {k}|alias]] for #topic{m} context. Project Alpha mention.',
    '',
    '- [ ] task {i}',
    '- [x] done {i}',
    '- item with $x^2$ math[^{i}]',
    '',
    '> quote {i}',
    '',
    '```js',
    'const value{i} = {i}',
    '```',
    '',
    '| a | b |',
    '| - | - |',
    '| {i} | {j} |',
    '',
    '[^{i}]: footnote {i}',
    ''
].join('\n')

export const buildDocument = (chars, noteCount = 1000) => {
    const parts = []
    let length = 0

    for (let i = 0; length < chars; i++) {
        const section = SECTION
            .replaceAll('{i}', i)
            .replaceAll('{j}', (i * 7) % noteCount)
            .replaceAll('{k}', (i * 13) % noteCount)
            .replaceAll('{m}', i % 20)
        parts.push(section)
        length += section.length + 1
    }

    return parts.join('\n')
}

const BODY_LINES = 12

export const buildNotes = (count) => Array.from({ length: count }, (_, i) => {
    const lines = Array.from({ length: BODY_LINES }, (__, line) => (
        `Line ${line} of note ${i} about topic ${(i + line) % 50} with [[Note ${(i * 3 + line) % count}]] #tag${i % 30}`
    ))

    if (i % 40 === 0) lines.push('Project Alpha is mentioned here')

    return {
        path: `repo::Note ${i}.md`,
        filename: `Note ${i}.md`,
        folderId: 'repo',
        title: i === 7 ? 'Project Alpha' : `Note ${i}`,
        note: lines.join('\n'),
        tags: [`tag${i % 30}`],
        properties: {},
        createdAt: 1700000000000 + i,
        updatedAt: 1700000000000 + i * 1000
    }
})

export const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b)

    return sorted[Math.floor(sorted.length / 2)]
}

export const measure = (fn, runs = 7) => {
    fn()
    const samples = Array.from({ length: runs }, () => {
        const start = performance.now()
        fn()

        return performance.now() - start
    })

    return median(samples)
}

export const report = (title, rows) => {
    process.stdout.write(`\n${title}\n${rows.map((row) => `  ${row}`).join('\n')}\n`)
}
