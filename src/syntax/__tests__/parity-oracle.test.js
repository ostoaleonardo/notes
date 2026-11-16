import fs from 'fs'

import { EXPECTED_PATH, loadCorpus } from '../__fixtures__/corpus'
import { describeNote } from '../__fixtures__/describe-note'

const corpus = loadCorpus()

const snapshot = () => Object.fromEntries(
    corpus.map(({ name, text }) => [name, describeNote(text)])
)

describe('parity corpus', () => {
    test('has the expected number of cases', () => {
        expect(corpus.length).toBeGreaterThanOrEqual(30)
    })

    test('the current extractors reproduce the recorded output', () => {
        if (process.env.PARITY_UPDATE === '1') {
            fs.writeFileSync(EXPECTED_PATH, `${JSON.stringify(snapshot(), null, 2)}\n`)
        }

        const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'))

        expect(snapshot()).toEqual(expected)
    })

    test.each(corpus.map(({ name }) => name))('%s is covered by the recorded output', (name) => {
        const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'))

        expect(Object.keys(expected)).toContain(name)
    })
})
