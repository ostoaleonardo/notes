import fs from 'fs'
import path from 'path'

const CORPUS_DIRECTORY = path.join(__dirname, 'corpus')

export const EXPECTED_PATH = path.join(__dirname, 'expected.json')

export const loadCorpus = () => fs.readdirSync(CORPUS_DIRECTORY)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => ({
        name: file.replace(/\.md$/, ''),
        text: fs.readFileSync(path.join(CORPUS_DIRECTORY, file), 'utf8')
    }))
