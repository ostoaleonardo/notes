import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { Option } from './option'
import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'

import { useMenuAction } from '@/hooks/use-menu-action'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { useRepositories } from '@/hooks/use-repositories'

import { ArrowForward } from '@/icons/arrow-forward'
import { Check } from '@/icons/check'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'
import { MENU_ITEM_INDENT, SCROLLABLE_MENU_MAX_HEIGHT, TRANSPARENT } from '@/constants/themes'

const OPTIONS = Object.values(STARTUP_BEHAVIORS)

const useMenuAnchor = () => {
    const rowRef = useRef(null)
    const menu = useMenuAction()
    const [anchor, setAnchor] = useState({ x: 0, y: 0 })

    const onPressRow = () => {
        rowRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x: x + width, y: y + height })
            menu.onOpen()
        })
    }

    return { rowRef, anchor, onPressRow, ...menu }
}

export function StartupOption() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const { activeRepository, getDescendants } = useRepositories()

    const behaviorMenu = useMenuAnchor()
    const folderMenu = useMenuAnchor()

    const [behavior, setBehavior] = useState(STARTUP_BEHAVIORS.LAST_OPENED)
    const [dailyFolder, setDailyFolder] = useState('')

    const folderStorageKey = activeRepository ? `${STORAGE_KEYS.DAILY_NOTE_FOLDER}:${activeRepository.id}` : null

    useStorageEffect(STORAGE_KEYS.STARTUP_BEHAVIOR, (value) => {
        if (value) setBehavior(value)
    })

    useEffect(() => setDailyFolder(''), [folderStorageKey])
    useStorageEffect(folderStorageKey, (value) => {
        if (value) setDailyFolder(value)
    })

    const onSelectBehavior = (value) => {
        setBehavior(value)
        setItem(STORAGE_KEYS.STARTUP_BEHAVIOR, value)
    }

    const onSelectFolder = (id) => {
        setDailyFolder(id)
        if (folderStorageKey) setItem(folderStorageKey, id)
    }

    const descendants = useMemo(() => (
        activeRepository ? getDescendants(activeRepository.id) : []
    ), [activeRepository, getDescendants])

    const selectedRepository = descendants.find((repository) => repository.id === dailyFolder)

    const showFolderOption = behavior === STARTUP_BEHAVIORS.DAILY_NOTE

    return (
        <>
            <View style={styles.group}>
                <View ref={behaviorMenu.rowRef} collapsable={false}>
                    <Option
                        title={t('settings.startup_behavior')}
                        description={t(`settings.startup_behavior_${behavior}`)}
                        rightContent={<ArrowForward color={colors.onBackground} />}
                        onPress={behaviorMenu.onPressRow}
                        isFirst={true}
                        isLast={!showFolderOption}
                    />
                </View>

                {showFolderOption && (
                    <View ref={folderMenu.rowRef} collapsable={false}>
                        <Option
                            title={t('settings.daily_note_folder')}
                            description={selectedRepository ? selectedRepository.alias : t('settings.daily_note_folder_root')}
                            rightContent={<ArrowForward color={colors.onBackground} />}
                            onPress={folderMenu.onPressRow}
                            isLast={true}
                        />
                    </View>
                )}
            </View>

            <MenuContainer
                visible={behaviorMenu.visible}
                onClose={behaviorMenu.onClose}
                anchor={behaviorMenu.anchor}
            >
                {OPTIONS.map((value) => {
                    const selected = value === behavior

                    return (
                        <MenuItem
                            key={value}
                            contentStyle={styles.item}
                            title={t(`settings.startup_behavior_${value}`)}
                            trailingIcon={selected ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                            style={selected && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                            onPress={() => behaviorMenu.trigger(() => onSelectBehavior(value))}
                        />
                    )
                })}
            </MenuContainer>

            <MenuContainer
                visible={folderMenu.visible}
                onClose={folderMenu.onClose}
                anchor={folderMenu.anchor}
            >
                <ScrollView style={styles.folderMenuScroll}>
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
        </>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: 3
    },
    item: {
        flexGrow: 1,
        marginRight: 12
    },
    folderMenuScroll: {
        maxHeight: SCROLLABLE_MENU_MAX_HEIGHT
    }
})
