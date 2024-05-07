import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { Avatar } from '@/components'
import { AccountModal } from '../Modals'
import { useGoogleDrive } from '@/hooks'
import { COLORS } from '@/constants'

export function HeaderAvatar() {
    const { isSyncing } = useGoogleDrive()
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    return (
        <View style={styles.container}>
            {isSyncing && <ActivityIndicator color={COLORS.text} />}

            <Pressable onPress={handleModal}>
                <Avatar />
            </Pressable>

            <AccountModal
                isVisible={isModalVisible}
                onClose={handleModal}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
})
