import RepositoryFs from 'repository-fs'

import { queryIndex } from '@/shared/utils/index-query'
import { buildLinkGraph } from '@/shared/utils/connection-model'
import { buildTagTree } from '@/shared/utils/drawer-tags'
import { extractProperties, parseFrontmatter, readFrontmatterTags } from '@/shared/utils/frontmatter'
import { buildNotePath } from '@/shared/utils/note-path'
import { collectTags } from '@/shared/utils/note-tags'

import { NOTE_FILE_EXTENSION } from '@/shared/constants/file-storage'
import {
    SCALE_CHECK_FOLDER_URI,
    SCALE_CHECK_FTS_QUERIES,
    SCALE_CHECK_LOG_PREFIX,
    SCALE_CHECK_READ_BATCH,
    SCALE_CHECK_FOLDER_ID,
    SCALE_CHECK_RUNS,
    SCALE_CHECK_SQL,
    SCALE_CHECK_TAG
} from '@/shared/constants/scale-check'

const log = (line) => console.log(`${SCALE_CHECK_LOG_PREFIX} ${line}`)

const heapMb = () => {
    const bytes = globalThis.HermesInternal?.getInstrumentedStats?.().js_heapSize
    return bytes == null ? 'n/a' : `${(bytes / 1048576).toFixed(0)} MB`
}

const best = async (task) => {
    const runs = []
    let result

    for (let run = 0; run < SCALE_CHECK_RUNS; run += 1) {
        const start = performance.now()
        result = await task()
        runs.push(performance.now() - start)
    }

    return { ms: Math.min(...runs).toFixed(0), first: runs[0].toFixed(0), result }
}

const readAll = async (uris) => {
    const texts = []

    for (let from = 0; from < uris.length; from += SCALE_CHECK_READ_BATCH) {
        texts.push(...await RepositoryFs.readTextFiles(uris.slice(from, from + SCALE_CHECK_READ_BATCH)))
    }

    return texts
}

const buildNotes = (names, uris, texts, modified) => names.map((filename, index) => {
    const { frontmatter, body, error, rawFrontmatter } = parseFrontmatter(texts[index] || '')

    return {
        filename,
        folderId: SCALE_CHECK_FOLDER_ID,
        path: buildNotePath(SCALE_CHECK_FOLDER_ID, filename),
        fileUri: uris[index],
        title: filename.slice(0, -NOTE_FILE_EXTENSION.length),
        note: body,
        tags: readFrontmatterTags(frontmatter),
        properties: extractProperties(frontmatter),
        rawFrontmatter: error ? null : rawFrontmatter ?? null,
        invalidFrontmatter: error ? rawFrontmatter : null,
        updatedAt: modified[index]
    }
})

const measureJs = async (notes) => {
    const notePaths = new Map(notes.map((note) => [note.path, '']))

    const coldTags = await best(() => collectTags(notes))
    log(`js tags collect (first run computes inline tags): first ${coldTags.first} ms, warm ${coldTags.ms} ms, ${coldTags.result.length} tags`)

    const tree = await best(() => buildTagTree(notes))
    log(`js tag tree for the drawer: best ${tree.ms} ms`)

    const graph = await best(() => buildLinkGraph({ notes, notePaths }))
    log(`js link graph for connections (first run extracts links): first ${graph.first} ms, warm ${graph.ms} ms`)
}

const queryTime = async (label, sql, ...params) => {
    const search = await best(() => queryIndex(sql, ...params))
    log(`sqlite ${label}: best ${search.ms} ms (first ${search.first} ms), ${search.result.length} rows`)
}

const measureNative = async () => {
    const indexed = await best(async () => {
        await RepositoryFs.deleteFolderIndex(SCALE_CHECK_FOLDER_ID)
        return RepositoryFs.indexRepository(SCALE_CHECK_FOLDER_ID, SCALE_CHECK_FOLDER_URI)
    })

    const stats = indexed.result
    log(`native cold index: best ${indexed.ms} ms (scan ${stats.scanMs}, read+parse ${stats.readParseMs}, write ${stats.writeMs}), ${stats.total} notes`)

    const noop = await best(() => RepositoryFs.indexRepository(SCALE_CHECK_FOLDER_ID, SCALE_CHECK_FOLDER_URI))
    log(`native reconcile with no changes: best ${noop.ms} ms`)

    await queryTime('tags with counts', SCALE_CHECK_SQL.TAGS)
    await queryTime('notes with one tag', SCALE_CHECK_SQL.TAG_NOTES, SCALE_CHECK_TAG)

    for (const query of SCALE_CHECK_FTS_QUERIES) {
        await queryTime(`fts ${query}`, SCALE_CHECK_SQL.SEARCH, query)
    }

    await queryTime('resolved link edges', SCALE_CHECK_SQL.EDGES, SCALE_CHECK_FOLDER_ID)

}

export const checkScale = async () => {
    log(`js heap at start: ${heapMb()}`)

    const scan = await best(() => RepositoryFs.listDirectory(SCALE_CHECK_FOLDER_URI))
    const { uris, names, lastModified } = scan.result
    const markdown = names.map((_, index) => index).filter((index) => names[index].endsWith(NOTE_FILE_EXTENSION))
    const noteNames = markdown.map((index) => names[index])
    const noteUris = markdown.map((index) => uris[index])
    log(`scan: best ${scan.ms} ms, ${noteNames.length} notes`)

    const read = await best(() => readAll(noteUris))
    log(`read all bodies into JS: best ${read.ms} ms`)

    const noteModified = markdown.map((index) => lastModified[index])
    const build = await best(() => buildNotes(noteNames, noteUris, read.result, noteModified))
    log(`js parse frontmatter and build note objects: best ${build.ms} ms (first ${build.first} ms)`)
    log(`js heap with ${build.result.length} notes loaded: ${heapMb()}`)

    await measureJs(build.result)
    await measureNative()

    log(`js heap at the end: ${heapMb()}`)
    log('done')
}
