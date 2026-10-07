import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DrawerList } from './drawer-list'
import { DrawerFileItem } from './drawer-file-item'
import { Typography } from '@/components/typography'

import { useAttachmentFiles } from '@/hooks/use-attachment-files'
import { useOpenFile } from '@/hooks/use-open-file'

import { FILE_KINDS } from '@/constants/file-types'
import { OPACITY } from '@/constants/theme'

export function DrawerFilesView({ closeDrawer }) {
    const { t } = useTranslation()
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

    const empty = useMemo(() => (
        <Typography opacity={OPACITY.secondary}>{t('drawer.files_empty')}</Typography>
    ), [t])

    return (
        <DrawerList
            data={rows}
            renderItem={renderItem}
            ListEmptyComponent={empty}
        />
    )
}
