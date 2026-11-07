import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useShowProperties } from './use-show-properties'
import { useTags } from './use-tags'
import {
    applyPropertyChange,
    buildPropertyRows,
    buildPropertySuggestions
} from '@/utils/properties'
import { hasTag, isValidTagName, sanitizeTagName } from '@/utils/tag-names'

import { EDITABLE_PROPERTY_TYPES } from '@/constants/properties'

export function usePropertiesPanel({ tags, properties, setTags, setProperties, invalid }) {
    const { t } = useTranslation()
    const { tags: allTags } = useTags()
    const { propertiesVisible, onToggleProperties } = useShowProperties()

    const onRemoveTag = useCallback((name) => {
        setTags((prev) => prev.filter((tag) => tag !== name))
    }, [setTags])

    const onAddTag = useCallback((name) => {
        const clean = sanitizeTagName(name)
        if (!isValidTagName(clean)) return

        setTags((prev) => hasTag(prev, clean) ? prev : [...prev, clean])
    }, [setTags])

    const onChangeProperty = useCallback((change) => {
        setProperties((prev) => applyPropertyChange(prev, change))
    }, [setProperties])

    const labels = useMemo(() => ({
        add: t('properties.add'),
        remove: t('properties.remove'),
        namePlaceholder: t('properties.name_placeholder'),
        valuePlaceholder: t('properties.value_placeholder'),
        types: Object.fromEntries(
            EDITABLE_PROPERTY_TYPES.map((type) => [type, t(`properties.type.${type}`)])
        )
    }), [t])

    const rows = useMemo(() => buildPropertyRows(properties), [properties])

    const suggestions = useMemo(() => (
        buildPropertySuggestions({ properties, tags })
    ), [properties, tags])

    const propertiesPanel = useMemo(() => ({
        tags,
        allTags,
        rows,
        suggestions,
        labels,
        label: t('title.tags'),
        visible: propertiesVisible,
        invalid,
        invalidTitle: t('tags.invalid_properties.title'),
        invalidDescription: t('tags.invalid_properties.description')
    }), [tags, allTags, rows, suggestions, labels, t, propertiesVisible, invalid])

    return { propertiesPanel, onAddTag, onRemoveTag, onChangeProperty, onToggleProperties }
}
