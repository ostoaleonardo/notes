import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'

import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Close } from '@/icons/close'
import { Delete } from '@/icons/delete'
import { Edit } from '@/icons/edit'
import { MoreVert } from '@/icons/more-vert'

export function RepositoryMenu({ onRename, onForget, onDelete }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const { visible, onOpen, onClose, trigger } = useMenuAction()

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <Tooltip title={t('button.more')}>
                    <IconButton
                        icon={(props) => <MoreVert {...props} />}
                        onPress={onOpen}
                        accessibilityLabel={t('button.more')}
                    />
                </Tooltip>
            }
        >
            <MenuItem
                title={t('repositories.rename')}
                leadingIcon={(props) => <Edit {...props} />}
                onPress={() => trigger(onRename)}
            />
            <MenuItem
                title={t('repositories.forget')}
                leadingIcon={(props) => <Close {...props} />}
                onPress={() => trigger(onForget)}
            />
            <MenuItem
                title={t('repositories.delete')}
                leadingIcon={(props) => <Delete {...props} color={colors.error} />}
                onPress={() => trigger(onDelete)}
            />
        </MenuContainer>
    )
}
