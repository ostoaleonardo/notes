package com.monospace.notes.repository

import android.content.Context
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.runBlocking
import uniffi.engine.Engine
import uniffi.engine.EngineException
import uniffi.engine.NoteReader
import uniffi.engine.SearchHandle

internal class LocationNoteReader(
    private val context: Context,
    private val dispatcher: CoroutineDispatcher
) : NoteReader {
    override fun read(locations: List<String>): List<String?> =
        runBlocking { readAll(context, locations, dispatcher) { it } }
}

internal class SearchRegistry {
    private val handles = java.util.concurrent.ConcurrentHashMap<Int, SearchHandle>()
    private val warming = java.util.concurrent.atomic.AtomicBoolean(false)
    private val counter = java.util.concurrent.atomic.AtomicInteger(FIRST_SEARCH_ID)

    fun open(
        context: Context,
        engine: Engine,
        dispatcher: CoroutineDispatcher,
        requestJson: String
    ): Int? {
        val handle = try {
            engine.search(requestJson, LocationNoteReader(context, dispatcher))
        } catch (error: EngineException.InvalidQuery) {
            return null
        }

        return counter.getAndIncrement().also { handles[it] = handle }
    }

    fun step(id: Int, size: Int): Map<String, Any?> {
        val step = handles[id]?.step(size.toUInt())

        return mapOf(
            SearchKeys.FOLDER_IDS to (step?.folderIds ?: emptyList()),
            SearchKeys.FILENAMES to (step?.filenames ?: emptyList()),
            SearchKeys.DONE to (step?.done ?: true)
        )
    }

    fun close(id: Int) {
        handles.remove(id)?.cancel()
    }

    fun warm(
        context: Context,
        engine: Engine,
        dispatcher: CoroutineDispatcher,
        folderIds: List<String>
    ) {
        if (!warming.compareAndSet(false, true)) return

        try {
            val warmup = engine.warm(folderIds, LocationNoteReader(context, dispatcher))

            while (!warmup.step(WARM_STEP_SIZE.toUInt())) {
                continue
            }
        } finally {
            warming.set(false)
        }
    }
}

internal object SearchKeys {
    const val FOLDER_IDS = "folderIds"
    const val FILENAMES = "filenames"
    const val DONE = "done"
}

internal const val FIRST_SEARCH_ID = 1
internal const val WARM_STEP_SIZE = 200
