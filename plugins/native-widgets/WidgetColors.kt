package __PACKAGE__

import androidx.compose.ui.graphics.Color
import androidx.glance.color.ColorProvider as DayNightColorProvider
import androidx.glance.unit.ColorProvider

fun WidgetState.provider(alpha: Float = 1f, select: (WidgetPalette) -> Color): ColorProvider {
    val day = select(light).let { it.copy(alpha = it.alpha * alpha) }
    val night = select(dark).let { it.copy(alpha = it.alpha * alpha) }

    return when (mode) {
        WidgetModes.LIGHT -> ColorProvider(day)
        WidgetModes.DARK -> ColorProvider(night)
        else -> DayNightColorProvider(day = day, night = night)
    }
}

fun WidgetState.background() = provider(glassAlpha) { it.background }

fun WidgetState.surface() = provider(glassAlpha) { it.surface }

fun WidgetState.text() = provider { it.text }

fun WidgetState.muted() = provider { it.muted }

fun WidgetState.headline(): Int =
    if (WidgetData.isGeist(this)) R.font.geist_regular else R.font.n_type82_headline
