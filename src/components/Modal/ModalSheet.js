import { KeyboardAvoidingView, Modal, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { IconButton } from '../Button'
import { Cross } from '@/icons'
import { colors, fonts } from '@/constants'

export function ModalSheet({ isVisible, onClose, title, children }) {
    return (
        <Modal
            transparent
            visible={isVisible}
            animationType='slide'
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                behavior='height'
                style={styles.keyboardAvoidingView}
            >
                <View
                    style={styles.modalBackdrop}
                    onStartShouldSetResponder={onClose}
                />
                <View style={styles.modalContent}>
                    <View style={styles.headerContainer}>
                        <Typography
                            opacity={0.5}
                            variant='subtitle'
                        >
                            {title}
                        </Typography>
                        <IconButton
                            size='sm'
                            variant='light'
                            icon={
                                <Cross
                                    width={24}
                                    height={24}
                                    rotation={45}
                                    color={colors.text}
                                />
                            }
                            onPress={onClose}
                        />
                    </View>
                    <View style={styles.bodyContainer}>
                        {children}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        width: '100%',
        height: '100%',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: colors.overlay,
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: colors.foreground,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bodyContainer: {
        width: '100%',
        height: '100%',
        paddingTop: 24,
        alignItems: 'center',
    },
})
