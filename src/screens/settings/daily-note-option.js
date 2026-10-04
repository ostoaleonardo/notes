import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { Option } from './option'
import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'

import { ArrowForward } from '@/icons/arrow-forward'
import { Check } from '@/icons/check'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TRANSPARENT } from '@/constants/themes'
import { MENU_ITEM_INDENT, SCROLLABLE_MENU_MAX_HEIGHT } from '@/constants/menu'
import { SPACING } from '@/constants/spacing'

export function DailyNoteOption() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const { activeRepository, getDescendants } = useRepositories()
    const { listTemplates } = useTemplates()

    const folderMenu = useMenuAnchor()
    const templateMenu = useMenuAnchor()

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

    const selectedRepository = descendants.find((repository) => repository.id === dailyFolder)
    const selectedTemplate = templates.find((template) => template.filename === dailyTemplate)

    return (
        <View>
            <View style={styles.group}>
                <View ref={folderMenu.rowRef} collapsable={false}>
                    <Option
                        title={t('settings.daily_note_folder')}
                        description={selectedRepository ? selectedRepository.alias : t('settings.daily_note_folder_root')}
                        rightContent={<ArrowForward color={colors.onBackground} />}
                        onPress={folderMenu.onPressRow}
                        isFirst={true}
                    />
                </View>

                <View ref={templateMenu.rowRef} collapsable={false}>
                    <Option
                        title={t('settings.daily_note_template')}
                        description={selectedTemplate
                            ? t(`templates.${selectedTemplate.name}`, selectedTemplate.name)
                            : t('settings.daily_note_template_none')}
                        rightContent={<ArrowForward color={colors.onBackground} />}
                        onPress={templateMenu.onPressRow}
                        isLast={true}
                    />
                </View>
            </View>

            <MenuContainer
                visible={folderMenu.visible}
                onClose={folderMenu.onClose}
                anchor={folderMenu.anchor}
            >
                <ScrollView style={styles.menuScroll}>
                    <MenuItem
                        contentStyle={styles.item}
                        title={t('settings.daily_note_folder_root')}
                        trailingIcon={!dailyFolder ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                        style={!dailyFolder && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                        onPress={() => folderMenu.trigger(() => onSelectFolder(''))}
                    />
                    {descendants.map((repository) => {
                        const selected = repository.id === dailyFolder

                        return (
                            <MenuItem
                                key={repository.id}
                                contentStyle={[styles.item, { paddingLeft: repository.depth * MENU_ITEM_INDENT }]}
                                title={repository.alias}
                                trailingIcon={selected ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                                style={selected && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                                onPress={() => folderMenu.trigger(() => onSelectFolder(repository.id))}
                            />
                        )
                    })}
                </ScrollView>
            </MenuContainer>

            <MenuContainer
                visible={templateMenu.visible}
                onClose={templateMenu.onClose}
                anchor={templateMenu.anchor}
            >
                <ScrollView style={styles.menuScroll}>
                    <MenuItem
                        contentStyle={styles.item}
                        title={t('settings.daily_note_template_none')}
                        trailingIcon={!dailyTemplate ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                        style={!dailyTemplate && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                        onPress={() => templateMenu.trigger(() => onSelectTemplate(''))}
                    />
                    {templates.map((template) => {
                        const selected = template.filename === dailyTemplate

                        return (
                            <MenuItem
                                key={template.filename}
                                contentStyle={styles.item}
                                title={t(`templates.${template.name}`, template.name)}
                                trailingIcon={selected ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                                style={selected && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                                onPress={() => templateMenu.trigger(() => onSelectTemplate(template.filename))}
                            />
                        )
                    })}
                </ScrollView>
            </MenuContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: 3
    },
    item: {
        flexGrow: 1,
        marginRight: SPACING.md
    },
    menuScroll: {
        maxHeight: SCROLLABLE_MENU_MAX_HEIGHT
    }
})
