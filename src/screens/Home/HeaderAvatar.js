import { useState } from 'react'
import { Pressable } from 'react-native'
import { Avatar } from '@/components'
import { AccountModal } from '../Modals'

export function HeaderAvatar() {
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    return (
        <>
            <Pressable onPress={handleModal}>
                <Avatar />
            </Pressable>

            <AccountModal
                isVisible={isModalVisible}
                onClose={handleModal}
            />
        </>
    )
}
