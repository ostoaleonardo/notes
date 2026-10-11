import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { useFolderSetting } from '@/hooks/use-folder-setting'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { scopedStorageKey } from '@/utils/scoped-storage-key'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SETTINGS_LIST } from '@/constants/components'

export function DailyNoteOption() {
    const { t } = useTranslation()
    const { setItem } = useStorage()
    const { activeRepository } = useRepositories()
    const { listTemplates } = useTemplates()

    const [dailyTemplate, setDailyTemplate] = useState('')
    const [templates, setTemplates] = useState([])

    const folder = useFolderSetting(STORAGE_KEYS.DAILY_NOTE_FOLDER, t('settings.daily_note.folder.root'))

    const templateStorageKey = activeRepository
        ? scopedStorageKey(STORAGE_KEYS.DAILY_NOTE_TEMPLATE, activeRepository.id)
        : null

    useEffect(() => setDailyTemplate(''), [templateStorageKey])
    useStorageEffect(templateStorageKey, (value) => {
        if (value) setDailyTemplate(value)
    })

    useEffect(() => {
        if (!activeRepository) return

        let cancelled = false
        listTemplates({ withContent: false }).then((value) => { if (!cancelled) setTemplates(value) })

        return () => { cancelled = true }
    }, [activeRepository, listTemplates])

    const onSelectTemplate = (filename) => {
        setDailyTemplate(filename)
        if (templateStorageKey) setItem(templateStorageKey, filename)
    }

    const templateItems = useMemo(() => [
        { value: '', title: t('settings.daily_note.template.none') },
        ...templates.map((template) => ({
            value: template.filename,
            title: t(`templates.names.${template.name}`, template.name)
        }))
    ], [templates, t])

    const selectedTemplate = templates.find((template) => template.filename === dailyTemplate)

    return (
        <View style={styles.group}>
            <SelectOption
                title={t('settings.daily_note.folder.title')}
                description={folder.description}
                items={folder.items}
                selectedValue={folder.selectedValue}
                onSelect={folder.onSelect}
                isFirst={true}
            />
            <SelectOption
                title={t('settings.daily_note.template.title')}
                description={selectedTemplate
                    ? t(`templates.names.${selectedTemplate.name}`, selectedTemplate.name)
                    : t('settings.daily_note.template.none')}
                items={templateItems}
                selectedValue={dailyTemplate}
                onSelect={onSelectTemplate}
                isLast={true}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: SETTINGS_LIST.itemGap
    }
})
