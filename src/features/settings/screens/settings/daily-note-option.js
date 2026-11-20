import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'
import { PositionGroup } from '@/ui/position-group'

import { useStorage } from '@/shared/hooks/use-storage'
import { useStorageEffect } from '@/shared/hooks/use-storage-effect'
import { useFolderSetting } from '@/features/settings/hooks/use-folder-setting'
import { useFolders } from '@/shared/hooks/use-folders'
import { useTemplates } from '@/shared/hooks/use-templates'
import { scopedStorageKey } from '@/shared/utils/scoped-storage-key'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { getSettingTestId } from '@/features/settings/utils/test-ids'

export const DailyNoteOption = () => {
    const { t } = useTranslation()
    const { setItem } = useStorage()
    const { activeFolder } = useFolders()
    const { listTemplates } = useTemplates()

    const [dailyTemplate, setDailyTemplate] = useState('')
    const [templates, setTemplates] = useState([])

    const folder = useFolderSetting(STORAGE_KEYS.DAILY_NOTE_FOLDER, t('settings.daily_note.folder.root'))

    const templateStorageKey = activeFolder
        ? scopedStorageKey(STORAGE_KEYS.DAILY_NOTE_TEMPLATE, activeFolder.id)
        : null

    useEffect(() => setDailyTemplate(''), [templateStorageKey])
    useStorageEffect(templateStorageKey, (value) => {
        if (value) setDailyTemplate(value)
    })

    useEffect(() => {
        if (!activeFolder) return

        let cancelled = false
        listTemplates({ withContent: false }).then((value) => { if (!cancelled) setTemplates(value) })

        return () => { cancelled = true }
    }, [activeFolder, listTemplates])

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
        <PositionGroup>
            <SelectOption
                title={t('settings.daily_note.folder.title')}
                description={folder.description}
                items={folder.items}
                selectedValue={folder.selectedValue}
                onSelect={folder.onSelect}
                testID={getSettingTestId(STORAGE_KEYS.DAILY_NOTE_FOLDER)}
            />
            <SelectOption
                title={t('settings.daily_note.template.title')}
                description={selectedTemplate
                    ? t(`templates.names.${selectedTemplate.name}`, selectedTemplate.name)
                    : t('settings.daily_note.template.none')}
                items={templateItems}
                selectedValue={dailyTemplate}
                onSelect={onSelectTemplate}
                testID={getSettingTestId(STORAGE_KEYS.DAILY_NOTE_TEMPLATE)}
            />
        </PositionGroup>
    )
}
