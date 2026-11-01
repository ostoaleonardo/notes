import { useEffect, useMemo } from 'react'
import { Keyboard } from 'react-native'
import { Portal, useTheme } from 'react-native-paper'
import { AlertDialog, Host, Text } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeContext } from '@/ui/compose-context'
import { paddingHorizontal } from '@/ui/utils/compose-modifiers'

import { DIALOG } from '@/ui/tokens/components'
import { FONTS, TYPOGRAPHY_SIZE_VARIANTS, SPACING } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

export function Dialog({
    title,
    visible,
    onDismiss,
    children,
    confirm,
    dismiss
}) {
    const { colors } = useTheme()

    useEffect(() => {
        if (!visible) Keyboard.dismiss()
    }, [visible])

    const dialogColors = useMemo(() => ({
        containerColor: colors.surface,
        titleContentColor: colors.onBackground + TINT.label,
        textContentColor: colors.onBackground
    }), [colors.surface, colors.onBackground])

    const modifiers = useMemo(() => [
        fillMaxWidth(),
        paddingHorizontal(SPACING.xxl)
    ], [])

    const titleStyle = useMemo(() => ({
        fontFamily: FONTS.azeretMedium,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall
    }), [])

    if (!visible) return null

    return (
        <Portal>
            <Host matchContents={DIALOG.matchContents} style={DIALOG.hostStyle}>
                <ComposeContext.Provider value>
                    <AlertDialog
                        colors={dialogColors}
                        modifiers={modifiers}
                        properties={DIALOG.properties}
                        onDismissRequest={onDismiss}
                    >
                        <AlertDialog.Title>
                            <Text style={titleStyle}>
                                {title.toLocaleUpperCase()}
                            </Text>
                        </AlertDialog.Title>
                        <AlertDialog.Text>
                            {children}
                        </AlertDialog.Text>
                        {!!confirm && <AlertDialog.ConfirmButton>{confirm}</AlertDialog.ConfirmButton>}
                        {!!dismiss && <AlertDialog.DismissButton>{dismiss}</AlertDialog.DismissButton>}
                    </AlertDialog>
                </ComposeContext.Provider>
            </Host>
        </Portal>
    )
}
