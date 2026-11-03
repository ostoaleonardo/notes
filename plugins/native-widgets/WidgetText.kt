package __PACKAGE__

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.text.StaticLayout
import android.text.TextPaint
import android.text.TextUtils
import android.util.TypedValue
import androidx.annotation.DrawableRes
import androidx.annotation.FontRes
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.unit.dp
import androidx.core.content.res.ResourcesCompat
import androidx.core.graphics.createBitmap
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalContext
import androidx.glance.layout.height
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.unit.ColorProvider
import kotlin.math.ceil

private class RenderedText(val bitmap: Bitmap, val widthDp: Float, val heightDp: Float)

@Composable
fun WidgetText(
    text: String,
    sizeSp: Float,
    @FontRes font: Int,
    color: ColorProvider,
    maxWidthDp: Float,
    maxLines: Int = 1,
    modifier: GlanceModifier = GlanceModifier
) {
    val context = LocalContext.current
    val rendered = remember(text, sizeSp, font, maxWidthDp, maxLines) {
        renderText(context, text, sizeSp, font, maxWidthDp, maxLines)
    }

    Image(
        provider = ImageProvider(rendered.bitmap),
        contentDescription = text,
        modifier = modifier.width(rendered.widthDp.dp).height(rendered.heightDp.dp),
        colorFilter = ColorFilter.tint(color)
    )
}

@Composable
fun WidgetIcon(@DrawableRes icon: Int, color: ColorProvider, sizeDp: Float) {
    Image(
        provider = ImageProvider(icon),
        contentDescription = null,
        modifier = GlanceModifier.size(sizeDp.dp),
        colorFilter = ColorFilter.tint(color)
    )
}

private fun renderText(
    context: Context,
    text: String,
    sizeSp: Float,
    font: Int,
    maxWidthDp: Float,
    maxLines: Int
): RenderedText {
    val metrics = context.resources.displayMetrics
    val paint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        color = AndroidColor.WHITE
        typeface = ResourcesCompat.getFont(context, font)
        textSize = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, sizeSp, metrics)
    }
    val maxWidthPx = (maxWidthDp.coerceAtLeast(1f) * metrics.density).toInt()
    val layout = StaticLayout.Builder.obtain(text, 0, text.length, paint, maxWidthPx)
        .setMaxLines(maxLines)
        .setEllipsize(TextUtils.TruncateAt.END)
        .build()

    val width = (0 until layout.lineCount)
        .maxOfOrNull { ceil(layout.getLineWidth(it)).toInt() }
        ?.coerceAtLeast(1) ?: 1
    val height = layout.height.coerceAtLeast(1)

    val bitmap = createBitmap(width, height)
    layout.draw(Canvas(bitmap))

    return RenderedText(bitmap, width / metrics.density, height / metrics.density)
}
