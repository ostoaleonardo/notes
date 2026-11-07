import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { ListItem } from '@/ui/list-item'
import { SheetGroup } from '@/ui/modal/sheet-group'
import { useTheme } from '@/ui/hooks/use-theme'

import { MARKDOWN_GROUPS } from '@/constants/markdown-controls'

const GroupItem = memo(({
    action,
    Icon,
    onSelect
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <ListItem
            uppercase={false}
            background={colors.surfaceVariant}
            title={t(`markdown_action.${action}`)}
            leftContent={<Icon color={colors.onBackground} />}
            onPress={() => onSelect(action)}
        />
    )
})

export const MarkdownGroupSheet = memo(({
    sheet,
    group,
    onSelect
}) => {
    const { t } = useTranslation()
    const items = MARKDOWN_GROUPS[group]?.items

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
        >
            {group && <SheetTitle>{t(`markdown_group.${group}`)}</SheetTitle>}

            <SheetGroup>
                {items?.map(({ action, Icon }) => (
                    <GroupItem
                        key={action}
                        action={action}
                        Icon={Icon}
                        onSelect={onSelect}
                    />
                ))}
            </SheetGroup>
        </ModalBottomSheet>
    )
})
