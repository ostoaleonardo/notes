import RepositoryFs from 'repository-fs'

import { queryIndex } from '@/utils/index-query'
import { buildLinkGraph } from '@/utils/connection-model'
import { buildTagTree } from '@/utils/drawer-tags'
import { extractProperties, parseFrontmatter, readFrontmatterTags } from '@/utils/frontmatter'
import { buildNotePath } from '@/utils/note-path'
import { collectTags } from '@/utils/note-tags'
import { createMemorySource, createSearchCursor } from '@/utils/search-cursor'
import { SourceOverflowError, searchIndex } from '@/utils/search-index'
import { getNoteComparator, sortNotes } from '@/utils/note-sort'
import { sortInChunks } from '@/utils/sort-in-chunks'
import { searchNotes } from '@/utils/search-filter'
import { parseSearchQuery } from '@/utils/search-parser'

import { NOTE_FILE_EXTENSION } from '@/constants/file-storage'
import { SEARCH_PAGE_SIZE } from '@/constants/search-index'
import {
    SCALE_CHECK_FOLDER_URI,
    SCALE_CHECK_FTS_QUERIES,
    SCALE_CHECK_LOG_PREFIX,
    SCALE_CHECK_READ_BATCH,
    SCALE_CHECK_REPOSITORY_ID,
    SCALE_CHECK_RUNS,
    SCALE_CHECK_SEARCHES,
    SCALE_CHECK_SORT,
    SCALE_CHECK_SQL,
    SCALE_CHECK_TAG
} from '@/constants/scale-check'

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
        repositoryId: SCALE_CHECK_REPOSITORY_ID,
        path: buildNotePath(SCALE_CHECK_REPOSITORY_ID, filename),
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
    const context = { pinned: new Set(), notePaths, matchCase: false }

    const coldTags = await best(() => collectTags(notes))
    log(`js tags collect (first run computes inline tags): first ${coldTags.first} ms, warm ${coldTags.ms} ms, ${coldTags.result.length} tags`)

    const tree = await best(() => buildTagTree(notes))
    log(`js tag tree for the drawer: best ${tree.ms} ms`)

    const graph = await best(() => buildLinkGraph({ notes, notePaths }))
    log(`js link graph for connections (first run extracts links): first ${graph.first} ms, warm ${graph.ms} ms`)

    for (const query of SCALE_CHECK_SEARCHES) {
        const ast = parseSearchQuery(query)
        const search = await best(() => searchNotes(notes, ast, context, null))
        log(`js search "${query}": best ${search.ms} ms (first ${search.first} ms), ${search.result.length} notes`)
    }
}

const drainCursor = async (makeSource, ast, context, start = performance.now()) => {
    const cursor = createSearchCursor({ source: makeSource(), ast, context })
    const first = await cursor.next(SEARCH_PAGE_SIZE)
    const firstMs = performance.now() - start
    const results = [...first.found]
    let done = first.done

    while (!done) {
        const next = await cursor.next(SEARCH_PAGE_SIZE)
        results.push(...next.found)
        done = next.done
    }

    return { firstMs: firstMs.toFixed(0), totalMs: (performance.now() - start).toFixed(0), first: first.found.length, results }
}

const drainWithFallback = async (source, notes, ast, context) => {
    const start = performance.now()
    const memorySource = () => createMemorySource(notes, SCALE_CHECK_SORT)

    if (!source) return { via: 'memory', ...await drainCursor(memorySource, ast, context, start) }

    try {
        return { via: 'database', ...await drainCursor(() => source, ast, context, start) }
    } catch (error) {
        if (!(error instanceof SourceOverflowError)) throw error

        return { via: 'memory after overflow', ...await drainCursor(memorySource, ast, context, start) }
    }
}

const measurePrefilter = async (notes) => {
    const notePaths = new Map(notes.map((note) => [note.path, '']))
    const context = { pinned: new Set(), notePaths, matchCase: false }

    const refresh = await best(() => searchIndex.refresh(notes))
    log(`search index coverage refresh: best ${refresh.ms} ms`)

    const sortStart = performance.now()
    sortNotes(notes, SCALE_CHECK_SORT)
    log(`js sort of ${notes.length} notes by name in one pass: ${(performance.now() - sortStart).toFixed(0)} ms`)

    const chunkStart = performance.now()
    await sortInChunks(notes, getNoteComparator(SCALE_CHECK_SORT))
    log(`js sort in chunks: ${(performance.now() - chunkStart).toFixed(0)} ms`)

    for (const query of SCALE_CHECK_SEARCHES) {
        const ast = parseSearchQuery(query)
        const full = await best(() => searchNotes(notes, ast, context, SCALE_CHECK_SORT))
        const request = { ast, notes, notePaths, sort: SCALE_CHECK_SORT }
        const source = searchIndex.createSource(request)
        const paged = await drainWithFallback(source, notes, ast, context)
        const memory = await drainCursor(() => createMemorySource(notes, SCALE_CHECK_SORT), ast, context)

        log(`paged search "${query}" via ${paged.via}: first page ${paged.firstMs} ms (${paged.first}), `
            + `everything ${paged.totalMs} ms (${paged.results.length} results), `
            + `memory pages: first ${memory.firstMs} ms, everything ${memory.totalMs} ms, `
            + `full scan ${full.ms} ms (${full.result.length} results), `
            + `same order as full scan: ${sameResults(full.result, paged.results)}`)
    }
}

const sameResults = (a, b) => a.length === b.length && a.every((note, index) => note === b[index])

const queryTime = async (label, sql, ...params) => {
    const search = await best(() => queryIndex(sql, ...params))
    log(`sqlite ${label}: best ${search.ms} ms (first ${search.first} ms), ${search.result.length} rows`)
}

const measureNative = async () => {
    const indexed = await best(async () => {
        await RepositoryFs.deleteRepositoryIndex(SCALE_CHECK_REPOSITORY_ID)
        return RepositoryFs.indexRepository(SCALE_CHECK_REPOSITORY_ID, SCALE_CHECK_FOLDER_URI)
    })

    const stats = indexed.result
    log(`native cold index: best ${indexed.ms} ms (scan ${stats.scanMs}, read+parse ${stats.readParseMs}, write ${stats.writeMs}), ${stats.total} notes`)

    const noop = await best(() => RepositoryFs.indexRepository(SCALE_CHECK_REPOSITORY_ID, SCALE_CHECK_FOLDER_URI))
    log(`native reconcile with no changes: best ${noop.ms} ms`)

    await queryTime('tags with counts', SCALE_CHECK_SQL.TAGS)
    await queryTime('notes with one tag', SCALE_CHECK_SQL.TAG_NOTES, SCALE_CHECK_TAG)

    for (const query of SCALE_CHECK_FTS_QUERIES) {
        await queryTime(`fts ${query}`, SCALE_CHECK_SQL.SEARCH, query)
    }

    await queryTime('resolved link edges', SCALE_CHECK_SQL.EDGES, SCALE_CHECK_REPOSITORY_ID)

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
    await measurePrefilter(build.result)

    log(`js heap at the end: ${heapMb()}`)
    log('done')
}
