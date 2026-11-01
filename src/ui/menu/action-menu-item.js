import { createElement, memo, useCallback } from 'react'

import { MenuItem } from './menu-item'

export const ActionMenuItem = memo(function ActionMenuItem({
    title,
    icon,
    action,
    onTrigger
}) {
    const leadingIcon = useCallback((props) => createElement(icon, props), [icon])
    const onPress = useCallback(() => onTrigger(action), [onTrigger, action])

    return (
        <MenuItem
            title={title}
            leadingIcon={leadingIcon}
            onPress={onPress}
        />
    )
})
