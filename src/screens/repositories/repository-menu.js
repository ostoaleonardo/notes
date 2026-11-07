import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Menu } from '@/ui/menu/menu'
import { MenuGroup } from '@/ui/menu/menu-group'
import { MenuItem } from '@/ui/menu/menu-item'
import { ActionMenuItem } from '@/ui/menu/action-menu-item'
import { IconButton } from '@/ui/button/icon-button'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Close } from '@/icons/close'
import { Delete } from '@/icons/delete'
import { Edit } from '@/icons/edit'
import { MoreVert } from '@/icons/more-vert'

export const RepositoryMenu = memo(({
    onRename,
    onForget,
    onDelete
}) => {
    const { t } = useTranslation()

    const { visible, onOpen, onClose, trigger } = useMenuAction()

    const onPressDelete = useCallback(() => trigger(onDelete), [trigger, onDelete])

    return (
        <Menu
            visible={visible}
            onClose={onClose}
            anchor={
                <IconButton
                    icon={MoreVert}
                    label={t('button.more')}
                    onPress={onOpen}
                />
            }
        >
            <MenuGroup>
                <ActionMenuItem
                    title={t('repositories.rename.title')}
                    icon={Edit}
                    action={onRename}
                    onTrigger={trigger}
                />
                <ActionMenuItem
                    title={t('repositories.forget.title')}
                    icon={Close}
                    action={onForget}
                    onTrigger={trigger}
                />
                <MenuItem
                    title={t('repositories.delete.title')}
                    leadingIcon={Delete}
                    onPress={onPressDelete}
                />
            </MenuGroup>
        </Menu>
    )
})
