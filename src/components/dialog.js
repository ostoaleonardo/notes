import { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import { Dialog as PaperDialog, Portal } from 'react-native-paper'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS, OPACITY } from '@/constants/theme'

export function Dialog({ title, visible, onDismiss, children, actions }) {
    const [bottom, setBottom] = useState(0)

    useEffect(() => {
        function onKeyboardChange(e) {
            if (e?.endCoordinates?.height) {
                setBottom(e.endCoordinates.height / 2)
            } else {
                setBottom(0)
            }
        }

        const subscriptions = [
            Keyboard.addListener('keyboardDidHide', onKeyboardChange),
            Keyboard.addListener('keyboardDidShow', onKeyboardChange)
        ]

        return () => subscriptions.forEach((subscription) => subscription.remove())
    }, [])

    useEffect(() => {
        if (!visible) Keyboard.dismiss()
    }, [visible])

    return (
        <Portal>
            <PaperDialog
                visible={visible}
                onDismiss={onDismiss}
                style={{ bottom }}
            >
                <PaperDialog.Title
                    style={{
                        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall,
                        opacity: OPACITY.muted,
                        textTransform: 'uppercase',
                        fontFamily: FONTS.azeretMedium
                    }}
                >
                    {title}
                </PaperDialog.Title>
                <PaperDialog.Content>
                    {children}
                </PaperDialog.Content>
                <PaperDialog.Actions>
                    {actions}
                </PaperDialog.Actions>
            </PaperDialog>
        </Portal>
    )
}
