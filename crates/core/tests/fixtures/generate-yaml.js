const { CORE_SCHEMA, dump } = require('js-yaml')
const fs = require('fs')
const path = require('path')

const cases = [
    { tags: ['personal', 'work'] },
    { tags: ['a: b', 'has "quotes"', "it's", 'a #b', '#lead', 'x/y'] },
    { author: 'Ana', rating: 5, ratio: 1.5, done: true, none: null },
    { due: '2026-10-04', at: '2026-10-04T09:30' },
    { aliases: ['Alias', 'Other name'], tags: ['a'] },
    { text: 'two words', url: 'https://example.com/a?b=1', time: '10:30' },
    { numeric: '123', boolish: 'true', nullish: 'null', tilde: '~', float: '1.5', exp: '1e3' },
    { empty: '', space: ' lead', trail: 'trail ', colon: 'end:' },
    { dash: '-a', question: '?a', bracket: '[a]', brace: '{a}', star: '*a', amp: '&a', bang: '!a', pct: '%a', at: '@a', tick: '`a' },
    { nested: { a: 1, b: { c: 'deep', d: [1, 2] } } },
    { list: [{ name: 'x', value: 1 }, { name: 'y', value: 2 }] },
    { emptyList: [], emptyMap: {} },
    { unicode: 'Año ñandú', emoji: 'ok 🙂', japanese: '日本語' },
    { 'key with space': 'v', 'a:b': 'v', '123': 'num key' },
    { multi: 'line one\nline two' },
    { quote: 'say "hi"', apostrophe: "it's", both: `it's "x"` },
    { listOfLists: [[1, 2], [3]] },
    { mixed: [1, 'two', true, null, 'x: y'] }
]

const output = cases.map((value) => ({
    value,
    expected: dump(value, { schema: CORE_SCHEMA })
}))

fs.writeFileSync(path.join(__dirname, 'yaml-emit.json'), `${JSON.stringify(output, null, '\t')}\n`)
