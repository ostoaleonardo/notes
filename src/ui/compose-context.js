import { createContext, useContext } from 'react'
import { Host } from '@expo/ui/jetpack-compose'

export const ComposeContext = createContext(false)

export function ComposeHost({ children, ...props }) {
    const inCompose = useContext(ComposeContext)

    if (inCompose) return children

    return <Host matchContents {...props}>{children}</Host>
}
