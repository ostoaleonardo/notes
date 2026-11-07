import { cloneElement, useEffect, useMemo } from 'react'
import { Keyboard, Modal } from 'react-native'
import { AlertDialog, Host, Text } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeContext } from '@/ui/compose-context'
import { paddingHorizontal } from '@/ui/utils/compose-modifiers'
import { useTheme } from '@/ui/hooks/use-theme'

import { DIALOG } from '@/ui/tokens/components'
import { UI_TEST_IDS } from '@/ui/tokens/test-ids'
import { FONTS, TYPOGRAPHY_SIZE_VARIANTS, SPACING } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

const noop = () => {}

export const Dialog = ({
    title,
    visible,
    onDismiss,
    children,
    confirm,
    dismiss,
    locked = false
}) => {
    const { colors, dark } = useTheme()
    const onRequestClose = locked ? noop : onDismiss

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
        <Modal
            visible
            transparent
            statusBarTranslucent
            onRequestClose={onRequestClose}
        >
            <Host
                colorScheme={dark ? 'dark' : 'light'}
                matchContents={DIALOG.matchContents}
                style={DIALOG.hostStyle}
            >
                <ComposeContext.Provider value>
                    <AlertDialog
                        colors={dialogColors}
                        modifiers={modifiers}
                        properties={DIALOG.properties}
                        onDismissRequest={onRequestClose}
                    >
                        <AlertDialog.Title>
                            <Text style={titleStyle}>
                                {title.toLocaleUpperCase()}
                            </Text>
                        </AlertDialog.Title>
                        <AlertDialog.Text>
                            {children}
                        </AlertDialog.Text>
                        {!!confirm && (
                            <AlertDialog.ConfirmButton>
                                {cloneElement(confirm, { testID: UI_TEST_IDS.DIALOG_CONFIRM })}
                            </AlertDialog.ConfirmButton>
                        )}
                        {!!dismiss && (
                            <AlertDialog.DismissButton>
                                {cloneElement(dismiss, { testID: UI_TEST_IDS.DIALOG_CANCEL })}
                            </AlertDialog.DismissButton>
                        )}
                    </AlertDialog>
                </ComposeContext.Provider>
            </Host>
        </Modal>
    )
}
