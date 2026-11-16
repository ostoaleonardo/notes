import { useContext } from 'react'

import { PropertyIcon } from './dom-icon'
import { ThemeContext } from '@/features/editor/dom/markdown-dom-theme-context'
import { buildPropertyMenuItemStyle } from '@/features/editor/dom/markdown-dom-panel-theme'

import { keepFocus } from '@/features/editor/dom/utils/keep-focus'

export const PropertyMenuItem = ({
    iconPath,
    label,
    onSelect
}) => {
    const theme = useContext(ThemeContext)

    return (
        <div
            onMouseDown={keepFocus}
            onClick={onSelect}
            style={buildPropertyMenuItemStyle(theme)}
        >
            <PropertyIcon path={iconPath} />
            {label}
        </div>
    )
}
