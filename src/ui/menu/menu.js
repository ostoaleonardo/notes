import { Menu as PaperMenu } from 'react-native-paper'

import { PositionGroup } from '@/ui/position-group'

import { MENU } from '@/ui/tokens/components'
import { TRANSPARENT } from '@/ui/tokens/transparent'

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
