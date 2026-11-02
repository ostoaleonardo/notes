import { useCallback, useEffect, useState } from 'react'

import { DrawerList } from './drawer-list'
import { DrawerFilesEmpty } from './drawer-empty'
import { DrawerFileItem } from './drawer-file-item'

import { useAttachmentFiles } from '@/hooks/use-attachment-files'
import { useOpenFile } from '@/hooks/use-open-file'

import { FILE_KINDS } from '@/constants/file-types'
export function DrawerFilesView({ closeDrawer }) {
    const listFiles = useAttachmentFiles()
    const [rows, setRows] = useState([])

    useEffect(() => {
        setRows(listFiles())
    }, [listFiles])

    const openFile = useOpenFile()

    const onOpenFile = useCallback((file) => {
        if (file.kind === FILE_KINDS.IMAGE) closeDrawer()
        openFile(file)
    }, [closeDrawer, openFile])

    const renderItem = useCallback(({ item }) => (
        <DrawerFileItem
            file={item}
            onOpenFile={onOpenFile}
        />
    ), [onOpenFile])

    return (
        <DrawerList
            data={rows}
            renderItem={renderItem}
            ListEmptyComponent={DrawerFilesEmpty}
        />
    )
}
