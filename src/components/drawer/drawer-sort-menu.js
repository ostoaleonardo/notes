import { useTranslation } from 'react-i18next'

import { Menu } from '@/ui/menu/menu'
import { MenuGroup } from '@/ui/menu/menu-group'
import { SelectMenuItem } from '@/ui/menu/select-menu-item'
import { DrawerToolbarButton } from './drawer-toolbar'

import { useMenuAction } from '@/hooks/use-menu-action'

import { SortByAlpha } from '@/icons/sort-by-alpha'

import { NOTE_SORT_LABELS } from '@/constants/note-sort'
import { TEST_IDS } from '@/constants/test-ids'
import { getMenuItemTestId } from '@/ui/utils/test-ids'

const SORT_OPTIONS = Object.keys(NOTE_SORT_LABELS)

export const DrawerSortMenu = ({ sort, onChange }) => {
    const { t } = useTranslation()
    const { visible, onOpen, onClose, trigger } = useMenuAction()

    return (
        <Menu
            visible={visible}
            onClose={onClose}
            anchor={
                <DrawerToolbarButton
                    icon={SortByAlpha}
                    onPress={onOpen}
                    testID={TEST_IDS.DRAWER_SORT}
                    accessibilityLabel={t('drawer.sort.title')}
                />
            }
        >
            <MenuGroup>
                {SORT_OPTIONS.map((option) => (
                    <SelectMenuItem
                        key={option}
                        testID={getMenuItemTestId(option)}
                        selected={option === sort}
                        title={t(NOTE_SORT_LABELS[option])}
                        onPress={() => trigger(() => onChange(option))}
                    />
                ))}
            </MenuGroup>
        </Menu>
    )
}
