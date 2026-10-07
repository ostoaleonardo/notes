import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { MENU } from '@/constants/components'
import { SPACING } from '@/constants/theme'

export function DailyNoteOption() {
    const { t } = useTranslation()
    const { setItem } = useStorage()
    const { activeRepository, getDescendants } = useRepositories()
    const { listTemplates } = useTemplates()

    const [dailyFolder, setDailyFolder] = useState('')
    const [dailyTemplate, setDailyTemplate] = useState('')
    const [templates, setTemplates] = useState([])

    const folderStorageKey = activeRepository ? `${STORAGE_KEYS.DAILY_NOTE_FOLDER}:${activeRepository.id}` : null
    const templateStorageKey = activeRepository ? `${STORAGE_KEYS.DAILY_NOTE_TEMPLATE}:${activeRepository.id}` : null

    useEffect(() => setDailyFolder(''), [folderStorageKey])
    useStorageEffect(folderStorageKey, (value) => {
        if (value) setDailyFolder(value)
    })

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

    const onSelectFolder = (id) => {
        setDailyFolder(id)
        if (folderStorageKey) setItem(folderStorageKey, id)
    }

    const onSelectTemplate = (filename) => {
        setDailyTemplate(filename)
        if (templateStorageKey) setItem(templateStorageKey, filename)
    }

    const descendants = useMemo(() => (
        activeRepository ? getDescendants(activeRepository.id) : []
    ), [activeRepository, getDescendants])

    const folderItems = useMemo(() => [
        { value: '', title: t('settings.daily_note_folder_root') },
        ...descendants.map((repository) => ({
            value: repository.id,
            title: repository.alias,
            contentStyle: { paddingLeft: repository.depth * MENU.itemIndent }
        }))
    ], [descendants, t])

    const templateItems = useMemo(() => [
        { value: '', title: t('settings.daily_note_template_none') },
        ...templates.map((template) => ({
            value: template.filename,
            title: t(`templates.${template.name}`, template.name)
        }))
    ], [templates, t])

    const selectedRepository = descendants.find((repository) => repository.id === dailyFolder)
    const selectedTemplate = templates.find((template) => template.filename === dailyTemplate)

    return (
        <View style={styles.group}>
            <SelectOption
                title={t('settings.daily_note_folder')}
                description={selectedRepository ? selectedRepository.alias : t('settings.daily_note_folder_root')}
                items={folderItems}
                selectedValue={dailyFolder}
                onSelect={onSelectFolder}
                isFirst={true}
            />
            <SelectOption
                title={t('settings.daily_note_template')}
                description={selectedTemplate
                    ? t(`templates.${selectedTemplate.name}`, selectedTemplate.name)
                    : t('settings.daily_note_template_none')}
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
        gap: SPACING.xxs
    }
})
