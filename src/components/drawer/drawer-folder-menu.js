import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { MenuContainer } from '@/components/menu/menu-container'
import { DrawerIconButton } from './drawer-icon-button'
import { DrawerRepositoryMenu } from './drawer-repository-menu'

import { useMenuAction } from '@/hooks/use-menu-action'

import { MoreVert } from '@/icons/more-vert'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'

const ALL_ACTIONS = Object.values(REPOSITORY_ACTIONS)

export function DrawerFolderMenu({ actions = ALL_ACTIONS, createLabelKey, onAction }) {
    const { t } = useTranslation()
    const { visible, onOpen, onClose, trigger } = useMenuAction()

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <DrawerIconButton
                    onPress={onOpen}
                    style={styles.button}
                    icon={MoreVert}
                    accessibilityLabel={t('button.more')}
                />
            }
        >
            <DrawerRepositoryMenu
                actions={actions}
                createLabelKey={createLabelKey}
                onAction={(action) => trigger(() => onAction(action))}
            />
        </MenuContainer>
    )
}

const styles = StyleSheet.create({
    button: {
        margin: 0
    }
})
