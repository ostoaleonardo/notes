import RepositoryFs from 'repository-fs'
import { openDatabaseAsync } from 'expo-sqlite'

import { extractProperties, parseFrontmatter, readFrontmatterTags } from '@/utils/frontmatter'
import { extractInlineTags } from '@/utils/inline-tags'
import { extractWikiLinkTexts } from '@/utils/note-links'
import { dedupeTags } from '@/utils/tag-names'

import {
    INDEX_CHECK_DIFF_SAMPLES,
    INDEX_CHECK_FTS_RUNS,
    INDEX_CHECK_MIN_WORD_LENGTH,
    INDEX_CHECK_TOUCHED_NOTES
} from '@/constants/dev-menu'

const log = (line) => console.log(`[index] ${line}`)

const timed = async (task) => {
    const start = performance.now()
    const result = await task()

    return { result, ms: Math.round(performance.now() - start) }
}

const parseWithJs = (text) => {
    const { frontmatter, body, error } = parseFrontmatter(text)

    return {
        tags: dedupeTags([...readFrontmatterTags(frontmatter), ...extractInlineTags(body)]),
        links: extractWikiLinkTexts(body),
        keys: Object.keys(extractProperties(frontmatter)),
        invalid: error
    }
}

const groupByNote = (rows) => {
    const grouped = new Map()

    rows.forEach(({ note_id: id, value }) => {
        if (!grouped.has(id)) grouped.set(id, [])
        grouped.get(id).push(value)
    })

    return grouped
}

const readIndex = async (db, repositoryId) => {
    const notes = await db.getAllAsync(
        'SELECT id, filename, invalid_frontmatter AS invalid FROM notes WHERE repository_id = ?',
        repositoryId
    )

    const [tags, links, keys] = await Promise.all([
        db.getAllAsync('SELECT note_id, name AS value FROM tags ORDER BY note_id, position'),
        db.getAllAsync('SELECT note_id, text AS value FROM links ORDER BY note_id, position'),
        db.getAllAsync('SELECT note_id, key AS value FROM properties ORDER BY note_id, position')
    ])

    const grouped = { tags: groupByNote(tags), links: groupByNote(links), keys: groupByNote(keys) }

    return new Map(notes.map(({ id, filename, invalid }) => [filename, {
        tags: dedupeTags(grouped.tags.get(id) || []),
        links: grouped.links.get(id) || [],
        keys: grouped.keys.get(id) || [],
        invalid: invalid === 1
    }]))
}

const sameList = (a, b) => a.length === b.length && a.every((value, index) => value === b[index])

const compareWithJs = (files, texts, indexed) => {
    let different = 0
    let missing = 0
    const samples = []

    files.forEach((file, position) => {
        const row = indexed.get(file.name)

        if (!row) {
            missing += 1
            return
        }

        const expected = parseWithJs(texts[position] || '')

        const equal = sameList(expected.tags, row.tags)
            && sameList(expected.links, row.links)
            && sameList(expected.keys, row.keys)
            && expected.invalid === row.invalid

        if (equal) return

        different += 1
        if (samples.length < INDEX_CHECK_DIFF_SAMPLES) samples.push({ name: file.name, expected, row })
    })

    return { different, missing, samples }
}

const pickSearchTerm = (texts) => {
    const pattern = new RegExp(`[a-z]{${INDEX_CHECK_MIN_WORD_LENGTH},}`, 'i')

    for (const text of texts) {
        const match = text && parseFrontmatter(text).body.match(pattern)
        if (match) return match[0].toLowerCase()
    }

    return null
}

const searchTimes = async (db, term) => {
    const runs = []
    let count = 0

    for (let run = 0; run < INDEX_CHECK_FTS_RUNS; run += 1) {
        const start = performance.now()
        const rows = await db.getAllAsync('SELECT rowid FROM note_fts WHERE note_fts MATCH ?', term)
        runs.push(performance.now() - start)
        count = rows.length
    }

    return `${Math.min(...runs).toFixed(1)} ms for "${term}" (${count} notes)`
}

const describe = (label, ms, stats) => (
    `${label}: ${ms} ms, total ${stats.total}, added ${stats.added}, updated ${stats.updated}, `
    + `removed ${stats.removed}, unchanged ${stats.unchanged}, unreadable ${stats.unreadable} `
    + `(scan ${stats.scanMs} ms, read+parse ${stats.readParseMs} ms, write ${stats.writeMs} ms)`
)

export const checkIndex = async (repositories, scanMarkdownFiles) => {
    const scans = await Promise.all(repositories.map(async (repository) => ({
        repository,
        files: await scanMarkdownFiles(repository.uri)
    })))

    const { repository, files } = scans.sort((a, b) => b.files.length - a.files.length)[0]
    log(`repository ${repository.alias || repository.id}: ${files.length} notes`)

    let progressEvents = 0
    const subscription = RepositoryFs.addListener('onIndexProgress', () => { progressEvents += 1 })

    await RepositoryFs.pruneRepositoryIndex([repository.id])
    await RepositoryFs.deleteRepositoryIndex(repository.id)
    const cold = await timed(() => RepositoryFs.indexRepository(repository.id, repository.uri))
    log(describe('cold index', cold.ms, cold.result))
    log(`progress events during the cold index: ${progressEvents}`)

    const warm = await timed(() => RepositoryFs.indexRepository(repository.id, repository.uri))
    log(describe('unchanged reconcile', warm.ms, warm.result))

    const db = await openDatabaseAsync(RepositoryFs.indexDatabaseName)

    await db.runAsync(
        'UPDATE notes SET modified = 0 WHERE id IN (SELECT id FROM notes WHERE repository_id = ? LIMIT ?)',
        repository.id,
        INDEX_CHECK_TOUCHED_NOTES
    )

    const touched = await timed(() => RepositoryFs.indexRepository(repository.id, repository.uri))
    log(describe(`reconcile after touching ${INDEX_CHECK_TOUCHED_NOTES} notes`, touched.ms, touched.result))

    const texts = await RepositoryFs.readTextFiles(files.map((file) => file.uri))
    const indexed = await readIndex(db, repository.id)
    const parity = compareWithJs(files, texts, indexed)

    log(`parity with the JS parsers: ${files.length - parity.different - parity.missing}/${files.length} equal, `
        + `${parity.different} different, ${parity.missing} missing`)
    parity.samples.forEach((sample) => log(`difference ${JSON.stringify(sample).slice(0, 400)}`))

    const term = pickSearchTerm(texts)
    if (term) log(`full text search: ${await searchTimes(db, term)}`)

    const [{ version }] = await db.getAllAsync('SELECT sqlite_version() AS version')
    log(`sqlite ${version}`)

    subscription.remove()
    await db.closeAsync()
    log('done')
}
