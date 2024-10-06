import { Dialog, Portal } from 'react-native-paper'
import { FONTS } from '@/constants'

export function DialogModal({ title, visible, onDismiss, children, actions }) {
    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={onDismiss}
            >
                <Dialog.Title
                    style={{
                        fontSize: 12,
                        opacity: 0.5,
                        textTransform: 'uppercase',
                        fontFamily: FONTS.azeretMedium
                    }}
                >
                    {title}
                </Dialog.Title>
                <Dialog.Content>
                    {children}
                </Dialog.Content>
                <Dialog.Actions>
                    {actions}
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}
