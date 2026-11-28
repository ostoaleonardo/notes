import { useCallback, useEffect, useEffectEvent, useMemo, useRef } from 'react'
import { BackHandler } from 'react-native'
import { SlideInLeft, SlideInRight } from 'react-native-reanimated'

import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useFolders } from '@/shared/hooks/use-folders'
import { useNotes } from '@/shared/hooks/use-notes'
import { useUtils } from '@/shared/hooks/use-utils'
import { buildLevelRows, buildFolderTree, resolveLevel } from '@/features/drawer/utils/drawer-tree'
import { pushToMap } from '@/shared/utils/push-to-map'

import { DRAWER_ITEM_TYPES, LEVEL_DIRECTIONS } from '@/shared/constants/drawer-views'
import { ANIMATION_DURATION } from '@/shared/constants/theme'

const ENTERINGS = {
    [LEVEL_DIRECTIONS.FORWARD]: SlideInRight.duration(ANIMATION_DURATION),
    [LEVEL_DIRECTIONS.BACK]: SlideInLeft.duration(ANIMATION_DURATION)
}

export const useDrawerLevel = ({ sort, drawerOpen }) => {
    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { activeFolderTree } = useFolders()
    const { drawerFolderId, setDrawerFolderId } = useUtils()

    const direction = useRef(null)
    const listRef = useRef(null)

    const notesByFolder = useMemo(() => {
        const map = new Map()
        notes.forEach((note) => pushToMap(map, note.folderId, note))
        return map
    }, [notes])

    const tree = useMemo(
        () => buildFolderTree(activeFolderTree, notesByFolder, sort),
        [activeFolderTree, notesByFolder, sort]
    )

    const level = useMemo(() => resolveLevel(tree, drawerFolderId), [tree, drawerFolderId])
    const rows = useMemo(() => (level ? buildLevelRows(level) : []), [level])
    const hasFolders = useMemo(() => rows.some((row) => row.type === DRAWER_ITEM_TYPES.REPOSITORY), [rows])

    const folderId = level?.folder.id
    const parentId = level?.folder.parentId || null
    const isRoot = !parentId

    const goToFolder = useCallback((id, next) => {
        direction.current = next
        setDrawerFolderId(id)
    }, [setDrawerFolderId])

    const onEnterFolder = useCallback((id) => {
        goToFolder(id, LEVEL_DIRECTIONS.FORWARD)
    }, [goToFolder])

    const onUpLevel = useCallback(() => {
        goToFolder(parentId, LEVEL_DIRECTIONS.BACK)
    }, [goToFolder, parentId])

    useEffect(() => {
        if (drawerOpen) listRef.current?.scrollToOffset({ offset: 0, animated: false })
    }, [drawerOpen])

    const revealCurrentNote = useEffectEvent(() => {
        const note = notes.find((item) => item.path === currentId)
        if (note) goToFolder(note.folderId, LEVEL_DIRECTIONS.FORWARD)
    })

    useEffect(() => {
        revealCurrentNote()
    }, [currentId])

    useEffect(() => {
        if (!drawerOpen || isRoot) return undefined

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            onUpLevel()
            return true
        })

        return () => subscription.remove()
    }, [drawerOpen, isRoot, onUpLevel])

    return {
        rows,
        hasFolders,
        folderId,
        isRoot,
        listRef,
        entering: ENTERINGS[direction.current],
        onEnterFolder,
        onUpLevel
    }
}
