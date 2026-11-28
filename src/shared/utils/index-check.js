import { repositoryEngine } from '@/shared/utils/repository-engine'

import { queryIndex } from '@/shared/utils/index-query'
import { extractProperties, parseFrontmatter, readFrontmatterTags } from '@/shared/utils/frontmatter'
import { extractInlineTags } from '@/shared/utils/inline-tags'
import { extractWikiLinkTexts } from '@/shared/utils/note-links'
import { dedupeTags } from '@/shared/utils/tag-names'

import {
    INDEX_CHECK_DIFF_SAMPLES,
    INDEX_CHECK_FTS_RUNS,
    INDEX_CHECK_LOG_PREFIX,
    INDEX_CHECK_MIN_WORD_LENGTH,
    INDEX_CHECK_SQL,
    INDEX_CHECK_TOUCHED_NOTES,
    INDEX_CHECK_WORD_FLAGS
} from '@/shared/constants/index-check'
import { INDEX_INVALID_FLAG, INDEX_PROGRESS_EVENT } from '@/shared/constants/repository-index'
import { sameList } from '@/shared/utils/same-list'

const log = (line) => console.log(`${INDEX_CHECK_LOG_PREFIX} ${line}`)

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

const readIndex = async (folderId) => {
    const notes = await queryIndex(INDEX_CHECK_SQL.NOTES, folderId)

    const [tags, links, keys] = await Promise.all([
        queryIndex(INDEX_CHECK_SQL.TAGS),
        queryIndex(INDEX_CHECK_SQL.LINKS),
        queryIndex(INDEX_CHECK_SQL.PROPERTIES)
    ])

    const grouped = { tags: groupByNote(tags), links: groupByNote(links), keys: groupByNote(keys) }

    return new Map(notes.map(({ id, filename, invalid }) => [filename, {
        tags: dedupeTags(grouped.tags.get(id) || []),
        links: grouped.links.get(id) || [],
        keys: grouped.keys.get(id) || [],
        invalid: invalid === INDEX_INVALID_FLAG
    }]))
}

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
    const pattern = new RegExp(`[a-z]{${INDEX_CHECK_MIN_WORD_LENGTH},}`, INDEX_CHECK_WORD_FLAGS)

    for (const text of texts) {
        const match = text && parseFrontmatter(text).body.match(pattern)
        if (match) return match[0].toLowerCase()
    }

    return null
}

const searchTimes = async (term) => {
    const runs = []
    let count = 0

    for (let run = 0; run < INDEX_CHECK_FTS_RUNS; run += 1) {
        const start = performance.now()
        const rows = await queryIndex(INDEX_CHECK_SQL.SEARCH, term)
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

export const checkIndex = async (folders, scanMarkdownFiles) => {
    const scans = await Promise.all(folders.map(async (folder) => ({
        folder,
        files: await scanMarkdownFiles(folder.uri)
    })))

    const { folder, files } = scans.sort((a, b) => b.files.length - a.files.length)[0]
    log(`repository ${folder.alias || folder.id}: ${files.length} notes`)

    let progressEvents = 0
    const subscription = repositoryEngine.addListener(INDEX_PROGRESS_EVENT, () => { progressEvents += 1 })

    await repositoryEngine.pruneRepositoryIndex([folder.id])
    await repositoryEngine.deleteFolderIndex(folder.id)
    const cold = await timed(() => repositoryEngine.indexRepository(folder.id, folder.uri))
    log(describe('cold index', cold.ms, cold.result))
    log(`progress events during the cold index: ${progressEvents}`)

    const warm = await timed(() => repositoryEngine.indexRepository(folder.id, folder.uri))
    log(describe('unchanged reconcile', warm.ms, warm.result))

    await queryIndex(
        INDEX_CHECK_SQL.TOUCH,
        folder.id,
        INDEX_CHECK_TOUCHED_NOTES
    )

    const touched = await timed(() => repositoryEngine.indexRepository(folder.id, folder.uri))
    log(describe(`reconcile after touching ${INDEX_CHECK_TOUCHED_NOTES} notes`, touched.ms, touched.result))

    const texts = await repositoryEngine.readTextFiles(files.map((file) => file.uri))
    const indexed = await readIndex(folder.id)
    const parity = compareWithJs(files, texts, indexed)

    log(`parity with the JS parsers: ${files.length - parity.different - parity.missing}/${files.length} equal, `
        + `${parity.different} different, ${parity.missing} missing`)
    parity.samples.forEach((sample) => log(`difference ${JSON.stringify(sample).slice(0, 400)}`))

    const term = pickSearchTerm(texts)
    if (term) log(`full text search: ${await searchTimes(term)}`)

    const [{ version }] = await queryIndex(INDEX_CHECK_SQL.VERSION)
    log(`sqlite ${version}`)

    subscription.remove()
    log('done')
}
