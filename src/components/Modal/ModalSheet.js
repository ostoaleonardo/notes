import { KeyboardAvoidingView, Modal, StyleSheet, Text, View } from 'react-native'
import { IconButton } from '../Button'
import { colors, fonts } from '../../constants'

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
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {title}
                        </Text>
                        <IconButton
                            icon={<Text style={styles.closeText}>✕</Text>}
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    closeText: {
        fontSize: 12,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    bodyContainer: {
        width: '100%',
        height: '100%',
        paddingTop: 24,
        alignItems: 'center',
    },
})
