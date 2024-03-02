import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../../constants'

export function ModalSheet({ isVisible, onClose, title, children }) {
    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType='slide'
        >
            <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                    <Pressable onPress={onClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </Pressable>
                </View>
                <View style={styles.bodyContainer}>
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: colors.background,
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
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    bodyContainer: {
        gap: 16,
        paddingVertical: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
})
