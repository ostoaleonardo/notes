import { Menu as PaperMenu } from 'react-native-paper'

import { PositionGroup } from '@/components/position-group'

import { MENU } from '@/constants/components'
import { TRANSPARENT } from '@/constants/themes'

export function Menu({
    anchor,
    visible,
    onClose,
    position = 'top',
    children
}) {
    return (
        <PaperMenu
            elevation={0}
            anchor={anchor}
            visible={visible}
            onDismiss={onClose}
            anchorPosition={position}
            contentStyle={{
                gap: MENU.groupGap,
                backgroundColor: TRANSPARENT.color
            }}
        >
            <PositionGroup>
                {children}
            </PositionGroup>
        </PaperMenu>
    )
}
