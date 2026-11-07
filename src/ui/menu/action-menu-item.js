import { memo, useCallback } from 'react'

import { MenuItem } from './menu-item'

export const ActionMenuItem = memo(({
    title,
    icon,
    action,
    onTrigger
}) => {
    const onPress = useCallback(() => onTrigger(action), [onTrigger, action])

    return (
        <MenuItem
            title={title}
            leadingIcon={icon}
            onPress={onPress}
        />
    )
})
