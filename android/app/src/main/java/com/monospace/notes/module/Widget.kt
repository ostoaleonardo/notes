package com.monospace.notes.module

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.monospace.notes.widgets.NoteSharedPrefsUtil
import com.monospace.notes.widgets.NoteWidget

class Widget(private var context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "Widget"
    }

    @ReactMethod
    fun updateWidget(id: String) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val appWidgetIds =
            appWidgetManager.getAppWidgetIds(ComponentName(context, NoteWidget::class.java))

        for (appWidgetId in appWidgetIds) {
            val (_, noteId) = NoteSharedPrefsUtil.loadWidgetLayoutIdPref(
                context,
                appWidgetId
            )

            if (noteId == id) {
                NoteWidget.updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }

    @ReactMethod
    fun deleteWidget(id: String) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val appWidgetIds =
            appWidgetManager.getAppWidgetIds(ComponentName(context, NoteWidget::class.java))

        for (appWidgetId in appWidgetIds) {
            val (_, noteId) = NoteSharedPrefsUtil.loadWidgetLayoutIdPref(
                context,
                appWidgetId
            )

            if (noteId == id) {
                NoteSharedPrefsUtil.deleteWidgetLayoutIdPref(context, appWidgetId)
                appWidgetManager.updateAppWidget(appWidgetId, null)
            }
        }
    }
}