package __PACKAGE__

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.glance.currentState
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.LocalContext
import androidx.glance.LocalSize
import androidx.glance.action.Action
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.reflect.KClass

internal object WidgetMetrics {
    val compactWidth = 130.dp
    val tallHeight = 140.dp
    val barFullWidth = 240.dp
    val shortHeight = 100.dp
    val previewTile = DpSize(180.dp, 100.dp)
    val previewPinned = DpSize(180.dp, 190.dp)
    val previewBar = DpSize(360.dp, 100.dp)
    const val RADIUS = 20
    const val CHIP_RADIUS = 14
    const val PADDING = 14
    const val GAP = 10
    const val ICON = 22f
    const val BAR_ICON = 20f
    const val CHIP = 40
    const val BAR_GAP = 8
    const val TITLE_SIZE = 16f
    const val LABEL_SIZE = 12f
    const val SECTION_SIZE = 11f
    const val BODY_SIZE = 14f
    const val DATE_PATTERN = "yyyy-MM-dd"
    const val BAR_FULL_ACTIONS = 4
    const val BAR_COMPACT_ACTIONS = 3
    const val EXTRACT_LINES = 4
    const val TITLE_LINES = 2
}

private fun openLink(context: Context, link: String): Action = actionStartActivity(
    Intent(Intent.ACTION_VIEW, Uri.parse(link))
        .setPackage(context.packageName)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
)

private fun Dp.px(): Float = value

private fun today(): String = SimpleDateFormat(WidgetMetrics.DATE_PATTERN, Locale.US).format(Date())

@Composable
private fun ActionTile(
    state: WidgetState,
    link: String,
    icon: Int,
    title: String,
    subtitle: String?
) {
    val context = LocalContext.current
    val size = LocalSize.current
    val compact = size.width < WidgetMetrics.compactWidth
    val tall = size.height >= WidgetMetrics.tallHeight
    val textWidth = size.width.px() - WidgetMetrics.PADDING * 2 -
        if (tall) 0f else WidgetMetrics.ICON + WidgetMetrics.GAP

    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(state.background())
            .cornerRadius(WidgetMetrics.RADIUS.dp)
            .clickable(openLink(context, link)),
        contentAlignment = Alignment.Center
    ) {
        when {
            compact -> WidgetIcon(icon, state.text(), WidgetMetrics.ICON)
            tall -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
                WidgetIcon(icon, state.text(), WidgetMetrics.ICON)
                Spacer(GlanceModifier.height(WidgetMetrics.GAP.dp))
                TileTexts(state, title, subtitle, textWidth, Alignment.CenterHorizontally)
            }
            else -> Row(verticalAlignment = Alignment.CenterVertically) {
                WidgetIcon(icon, state.text(), WidgetMetrics.ICON)
                Spacer(GlanceModifier.width(WidgetMetrics.GAP.dp))
                TileTexts(state, title, subtitle, textWidth, Alignment.Start)
            }
        }
    }
}

@Composable
private fun TileTexts(
    state: WidgetState,
    title: String,
    subtitle: String?,
    widthDp: Float,
    alignment: Alignment.Horizontal
) {
    Column(horizontalAlignment = alignment) {
        WidgetText(title, WidgetMetrics.TITLE_SIZE, state.headline(), state.text(), widthDp)
        if (subtitle != null) {
            WidgetText(subtitle, WidgetMetrics.LABEL_SIZE, R.font.azeret_mono_light, state.muted(), widthDp)
        }
    }
}

@Composable
private fun PinnedTile(state: WidgetState) {
    val context = LocalContext.current
    val size = LocalSize.current
    val note = state.note
    val compact = size.width < WidgetMetrics.compactWidth
    val short = size.height < WidgetMetrics.shortHeight
    val textWidth = size.width.px() - WidgetMetrics.PADDING * 2

    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(state.background())
            .cornerRadius(WidgetMetrics.RADIUS.dp)
            .padding(WidgetMetrics.PADDING.dp)
            .clickable(openLink(context, note?.link ?: WidgetLinks.HOME)),
        contentAlignment = if (compact) Alignment.Center else Alignment.TopStart
    ) {
        if (compact) {
            WidgetIcon(R.drawable.widget_keep, state.text(), WidgetMetrics.ICON)
        } else {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    WidgetIcon(R.drawable.widget_keep, state.text(), WidgetMetrics.BAR_ICON)
                    Spacer(GlanceModifier.width((WidgetMetrics.GAP / 2).dp))
                    WidgetText(
                        state.labels.pinned.uppercase(),
                        WidgetMetrics.SECTION_SIZE,
                        R.font.azeret_mono_light,
                        state.muted(),
                        textWidth - WidgetMetrics.BAR_ICON
                    )
                }
                Spacer(GlanceModifier.height((WidgetMetrics.GAP / 2).dp))
                if (note == null) {
                    WidgetText(
                        state.labels.empty,
                        WidgetMetrics.BODY_SIZE,
                        R.font.azeret_mono_light,
                        state.muted(),
                        textWidth,
                        WidgetMetrics.TITLE_LINES
                    )
                } else {
                    WidgetText(
                        note.title,
                        WidgetMetrics.TITLE_SIZE,
                        state.headline(),
                        state.text(),
                        textWidth,
                        if (short) 1 else WidgetMetrics.TITLE_LINES
                    )
                    if (!short && note.extract.isNotEmpty()) {
                        Spacer(GlanceModifier.height((WidgetMetrics.GAP / 2).dp))
                        WidgetText(
                            note.extract,
                            WidgetMetrics.BODY_SIZE,
                            R.font.azeret_mono_light,
                            state.muted(),
                            textWidth,
                            WidgetMetrics.EXTRACT_LINES
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickBar(state: WidgetState) {
    val context = LocalContext.current
    val size = LocalSize.current
    val actions = listOf(
        R.drawable.widget_add to WidgetLinks.NEW_NOTE,
        R.drawable.widget_calendar_today to WidgetLinks.DAILY_NOTE,
        R.drawable.widget_note_stack to WidgetLinks.HOME,
        R.drawable.widget_keep to (state.note?.link ?: WidgetLinks.HOME)
    ).take(
        if (size.width >= WidgetMetrics.barFullWidth) WidgetMetrics.BAR_FULL_ACTIONS
        else WidgetMetrics.BAR_COMPACT_ACTIONS
    )

    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(state.background())
            .cornerRadius(WidgetMetrics.RADIUS.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            actions.forEachIndexed { index, (icon, link) ->
                if (index > 0) Spacer(GlanceModifier.width(WidgetMetrics.BAR_GAP.dp))
                Box(
                    modifier = GlanceModifier
                        .size(WidgetMetrics.CHIP.dp)
                        .background(state.surface())
                        .cornerRadius(WidgetMetrics.CHIP_RADIUS.dp)
                        .clickable(openLink(context, link)),
                    contentAlignment = Alignment.Center
                ) {
                    WidgetIcon(icon, state.text(), WidgetMetrics.BAR_ICON)
                }
            }
        }
    }
}

enum class WidgetKind(val receiver: KClass<out GlanceAppWidgetReceiver>, val previewSize: DpSize) {
    NEW_NOTE(NewNoteWidgetReceiver::class, WidgetMetrics.previewTile),
    DAILY_NOTE(DailyNoteWidgetReceiver::class, WidgetMetrics.previewTile),
    PINNED_NOTE(PinnedNoteWidgetReceiver::class, WidgetMetrics.previewPinned),
    QUICK_BAR(QuickBarWidgetReceiver::class, WidgetMetrics.previewBar)
}

@Composable
private fun WidgetContent(kind: WidgetKind, state: WidgetState, date: String) {
    when (kind) {
        WidgetKind.NEW_NOTE ->
            ActionTile(state, WidgetLinks.NEW_NOTE, R.drawable.widget_add, state.labels.newNote, null)
        WidgetKind.DAILY_NOTE -> ActionTile(
            state,
            WidgetLinks.DAILY_NOTE,
            R.drawable.widget_calendar_today,
            state.labels.dailyNote,
            date
        )
        WidgetKind.PINNED_NOTE -> PinnedTile(state)
        WidgetKind.QUICK_BAR -> QuickBar(state)
    }
}

object WidgetRefresh {
    val KEY = longPreferencesKey("refresh")
}

class NotesWidget(private val kind: WidgetKind) : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val refresh = currentState<Preferences>()[WidgetRefresh.KEY]
            val state = remember(refresh) { WidgetData.read(context) }
            val date = remember(refresh) { today() }

            WidgetContent(kind, state, date)
        }
    }

    override suspend fun providePreview(context: Context, widgetCategory: Int) {
        val state = WidgetData.read(context)
        val sample = WidgetNote(
            context.getString(R.string.widget_preview_note_title),
            context.getString(R.string.widget_preview_note_extract),
            WidgetLinks.HOME
        )
        val date = today()

        provideContent {
            CompositionLocalProvider(LocalSize provides kind.previewSize) {
                WidgetContent(kind, state.copy(note = state.note ?: sample), date)
            }
        }
    }
}

abstract class NotesWidgetReceiver(kind: WidgetKind) : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = NotesWidget(kind)
}

class NewNoteWidgetReceiver : NotesWidgetReceiver(WidgetKind.NEW_NOTE)

class DailyNoteWidgetReceiver : NotesWidgetReceiver(WidgetKind.DAILY_NOTE)

class PinnedNoteWidgetReceiver : NotesWidgetReceiver(WidgetKind.PINNED_NOTE)

class QuickBarWidgetReceiver : NotesWidgetReceiver(WidgetKind.QUICK_BAR)
