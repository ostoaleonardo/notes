import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { PositionGroup } from '@/ui/position-group'
import { Slider } from '@/ui/input/slider'
import { Switch } from '@/ui/button/switch'

import { useStorage } from '@/shared/hooks/use-storage'
import { useWidgetGlass } from '@/features/settings/hooks/use-widget-glass'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/shared/constants/storage-values'
import { WIDGET_GLASS_ALPHA } from '@/shared/constants/widgets'

export const WidgetsOption = () => {
    const { t } = useTranslation()
    const { setItem } = useStorage()
    const { glass, setGlass, alpha, setAlpha } = useWidgetGlass()

    const onToggleGlass = (value) => {
        setGlass(value)
        setItem(STORAGE_KEYS.WIDGET_GLASS, value ? STORAGE_BOOLEAN.TRUE : STORAGE_BOOLEAN.FALSE)
    }

    const onSaveAlpha = useCallback(() => {
        setItem(STORAGE_KEYS.WIDGET_GLASS_ALPHA, String(alpha))
    }, [setItem, alpha])

    const onChangeAlpha = useCallback((value) => setAlpha(Math.round(value)), [setAlpha])

    return (
        <PositionGroup>
            <ListItem
                title={t('settings.widgets.glass.title')}
                description={t('settings.widgets.glass.description')}
                rightContent={(
                    <Switch
                        value={glass}
                        onValueChange={onToggleGlass}
                        accessibilityLabel={t('settings.widgets.glass.title')}
                    />
                )}
            />
            {glass && (
                <ListItem
                    title={t('settings.widgets.glass.opacity')}
                    description={`${alpha}%`}
                >
                    <Slider
                        value={alpha}
                        min={WIDGET_GLASS_ALPHA.min}
                        max={WIDGET_GLASS_ALPHA.max}
                        onValueChange={onChangeAlpha}
                        onValueChangeFinished={onSaveAlpha}
                    />
                </ListItem>
            )}
        </PositionGroup>
    )
}
