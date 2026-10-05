import { useTranslation } from 'react-i18next'

import { MenuContainer } from '../menu/menu-container'
import { SelectMenuItem } from '../menu/select-menu-item'
import { DrawerToolbarButton } from './drawer-toolbar'

import { useMenuAction } from '@/hooks/use-menu-action'

import { SortByAlpha } from '@/icons/sort-by-alpha'

import { NOTE_SORT_LABELS } from '@/constants/note-sort'
import { TEST_IDS } from '@/constants/test-ids'

const SORT_OPTIONS = Object.keys(NOTE_SORT_LABELS)

export function DrawerSortMenu({ sort, onChange }) {
    const { t } = useTranslation()
    const { visible, onOpen, onClose, trigger } = useMenuAction()

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <DrawerToolbarButton
                    icon={SortByAlpha}
                    onPress={onOpen}
                    testID={TEST_IDS.DRAWER_SORT}
                    accessibilityLabel={t('drawer.sort_notes')}
                />
            }
        >
            {SORT_OPTIONS.map((option) => (
                <SelectMenuItem
                    key={option}
                    selected={option === sort}
                    title={t(NOTE_SORT_LABELS[option])}
                    onPress={() => trigger(() => onChange(option))}
                />
            ))}
        </MenuContainer>
    )
}
