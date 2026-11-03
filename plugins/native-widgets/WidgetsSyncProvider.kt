package __PACKAGE__

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.content.SharedPreferences
import android.database.Cursor
import android.net.Uri
import android.util.Log
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class WidgetsSyncProvider : ContentProvider() {
    override fun onCreate(): Boolean {
        val appContext = context?.applicationContext ?: return false

        listener = SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
            if (key == WidgetKeys.PROPS) {
                scope.launch { updateWidgets(appContext) }
                schedulePreviews(appContext)
            }
        }
        appContext
            .getSharedPreferences(WidgetKeys.PREFERENCES, Context.MODE_PRIVATE)
            .registerOnSharedPreferenceChangeListener(listener)
        schedulePreviews(appContext)

        return true
    }

    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? = null

    override fun getType(uri: Uri): String? = null

    override fun insert(uri: Uri, values: ContentValues?): Uri? = null

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<String>?): Int = 0

    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int = 0

    private companion object {
        const val TAG = "NotesWidgets"
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
        var listener: SharedPreferences.OnSharedPreferenceChangeListener? = null

        const val PREVIEW_DELAY_MS = 3000L

        var previewJob: Job? = null

        suspend fun updateWidgets(context: Context) {
            val appWidgets = AppWidgetManager.getInstance(context)
            val glance = GlanceAppWidgetManager(context)

            WidgetKind.entries.forEach { kind ->
                val widget = NotesWidget(kind)
                val ids = appWidgets.getAppWidgetIds(ComponentName(context, kind.receiver.java))

                ids.forEach {
                    val glanceId = glance.getGlanceIdBy(it)

                    updateAppWidgetState(context, glanceId) { state ->
                        state[WidgetRefresh.KEY] = System.nanoTime()
                    }
                    widget.update(context, glanceId)
                }
            }
        }

        fun schedulePreviews(context: Context) {
            previewJob?.cancel()
            previewJob = scope.launch {
                delay(PREVIEW_DELAY_MS)
                updatePreviews(context)
            }
        }

        suspend fun updatePreviews(context: Context) {
            if (!WidgetData.hasProps(context)) return

            val key = WidgetData.previewKey(context)
            val preferences = context.getSharedPreferences(WidgetKeys.PREVIEWS, Context.MODE_PRIVATE)

            if (preferences.getString(WidgetKeys.PREVIEW_KEY, null) == key) return

            val manager = GlanceAppWidgetManager(context)
            val published = runCatching {
                WidgetKind.entries.forEach { manager.setWidgetPreviews(it.receiver) }
            }.onFailure { Log.w(TAG, "Widget previews were not published", it) }.isSuccess

            if (published) preferences.edit().putString(WidgetKeys.PREVIEW_KEY, key).apply()
        }
    }
}
