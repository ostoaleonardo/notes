import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'

import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'
import { ActionMenuItem } from '@/components/menu/action-menu-item'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Close } from '@/icons/close'
import { Delete } from '@/icons/delete'
import { Edit } from '@/icons/edit'
import { MoreVert } from '@/icons/more-vert'

export const RepositoryMenu = memo(function RepositoryMenu({ onRename, onForget, onDelete }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const { visible, onOpen, onClose, trigger } = useMenuAction()

    const triggerIcon = useCallback((props) => <MoreVert {...props} />, [])
    const deleteIcon = useCallback((props) => <Delete {...props} color={colors.error} />, [colors.error])
    const onPressDelete = useCallback(() => trigger(onDelete), [trigger, onDelete])

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <Tooltip title={t('button.more')}>
                    <IconButton
                        icon={triggerIcon}
                        onPress={onOpen}
                        accessibilityLabel={t('button.more')}
                    />
                </Tooltip>
            }
        >
            <ActionMenuItem
                title={t('repositories.rename')}
                icon={Edit}
                action={onRename}
                onTrigger={trigger}
            />
            <ActionMenuItem
                title={t('repositories.forget')}
                icon={Close}
                action={onForget}
                onTrigger={trigger}
            />
            <MenuItem
                title={t('repositories.delete')}
                leadingIcon={deleteIcon}
                onPress={onPressDelete}
            />
        </MenuContainer>
    )
})
