package __PACKAGE__

import android.content.Context
import androidx.compose.ui.graphics.Color
import org.json.JSONObject

object WidgetModes {
    const val SYSTEM = "system"
    const val LIGHT = "light"
    const val DARK = "dark"
}

object WidgetKeys {
    const val PREFERENCES = "expo.modules.widgets"
    const val PROPS = "__expo_widgets_Bridge_props"
    const val PREVIEWS = "notes_widget_previews"
    const val PREVIEW_KEY = "preview_key"
}

object WidgetLinks {
    const val NEW_NOTE = "notes://notes/new"
    const val DAILY_NOTE = "notes://notes/daily"
    const val HOME = "notes://home"
}

data class WidgetPalette(
    val background: Color,
    val surface: Color,
    val text: Color,
    val muted: Color
)

data class WidgetLabels(
    val newNote: String,
    val dailyNote: String,
    val pinned: String,
    val empty: String
)

data class WidgetNote(val title: String, val extract: String, val link: String)

data class WidgetState(
    val light: WidgetPalette,
    val dark: WidgetPalette,
    val mode: String,
    val headingFont: String,
    val glassAlpha: Float,
    val labels: WidgetLabels,
    val note: WidgetNote?
)

object WidgetData {
    private val darkFallback = WidgetPalette(
        background = Color(0xFF06080A),
        surface = Color(0xFF121318),
        text = Color(0xFFF0F2F1),
        muted = Color(0xB3F0F2F1)
    )
    private val lightFallback = WidgetPalette(
        background = Color(0xFFD7D8D8),
        surface = Color(0xFFE7E9E9),
        text = Color(0xFF06080A),
        muted = Color(0xB306080A)
    )
    private const val GEIST_KEY = "geist"
    private const val PERCENT = 100f

    private val fallbackLabels = WidgetLabels(
        newNote = "New note",
        dailyNote = "Daily note",
        pinned = "Pinned",
        empty = "No pinned notes"
    )

    fun read(context: Context): WidgetState {
        val json = context
            .getSharedPreferences(WidgetKeys.PREFERENCES, Context.MODE_PRIVATE)
            .getString(WidgetKeys.PROPS, null)
            ?.let { runCatching { JSONObject(it) }.getOrNull() }

        val palettes = json?.optJSONObject("palettes")
        val labels = json?.optJSONObject("labels")
        val glass = json?.optJSONObject("glass")
        val glassActive = glass?.optBoolean("enabled", false) ?: false

        return WidgetState(
            light = palette(palettes?.optJSONObject(WidgetModes.LIGHT), lightFallback),
            dark = palette(palettes?.optJSONObject(WidgetModes.DARK), darkFallback),
            mode = json?.optString("mode")?.takeIf { it.isNotEmpty() } ?: WidgetModes.SYSTEM,
            headingFont = json?.optString("headingFont") ?: "",
            glassAlpha = if (glassActive) (glass?.optInt("alpha") ?: 100) / PERCENT else 1f,
            labels = WidgetLabels(
                newNote = labels.text("newNote", fallbackLabels.newNote),
                dailyNote = labels.text("dailyNote", fallbackLabels.dailyNote),
                pinned = labels.text("pinned", fallbackLabels.pinned),
                empty = labels.text("empty", fallbackLabels.empty)
            ),
            note = json?.optJSONObject("note")?.let {
                WidgetNote(it.optString("title"), it.optString("extract"), it.optString("link"))
            }
        )
    }

    fun hasProps(context: Context): Boolean = context
        .getSharedPreferences(WidgetKeys.PREFERENCES, Context.MODE_PRIVATE)
        .contains(WidgetKeys.PROPS)

    fun previewKey(context: Context): String {
        val state = read(context)

        return listOf(state.mode, state.headingFont, state.glassAlpha, state.light, state.dark)
            .joinToString("|")
            .hashCode()
            .toString()
    }

    fun isGeist(state: WidgetState): Boolean = state.headingFont == GEIST_KEY

    private fun palette(colors: JSONObject?, fallback: WidgetPalette) = WidgetPalette(
        background = parseColor(colors?.optString("background"), fallback.background),
        surface = parseColor(colors?.optString("surface"), fallback.surface),
        text = parseColor(colors?.optString("text"), fallback.text),
        muted = parseColor(colors?.optString("muted"), fallback.muted)
    )

    private fun JSONObject?.text(key: String, fallback: String): String =
        this?.optString(key)?.takeIf { it.isNotEmpty() } ?: fallback

    private fun parseColor(value: String?, fallback: Color): Color {
        val hex = value?.removePrefix("#") ?: return fallback

        return runCatching {
            when (hex.length) {
                6 -> Color(0xFF000000 or hex.toLong(16))
                8 -> Color((hex.substring(6).toLong(16) shl 24) or hex.substring(0, 6).toLong(16))
                else -> fallback
            }
        }.getOrDefault(fallback)
    }
}
