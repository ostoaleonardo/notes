import { Pressable, StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Picture, Camera } from '@/icons'
import { colors } from '@/constants'

export function PickerImage({ setImage, pickCamera }) {
    const handlePickCamera = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const handlePickGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            allowsEditing: true,
            quality: 1,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    return (
        <Pressable
            style={styles.container}
            onPress={pickCamera ? handlePickCamera : handlePickGallery}
        >
            {pickCamera
                ? (
                    <Camera
                        width={24}
                        height={24}
                        color={colors.background}
                    />
                ) : (
                    <Picture
                        width={24}
                        height={24}
                        color={colors.background}
                    />
                )
            }
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.text,
    },
    title: {
        fontSize: 16,
        color: colors.background,
        transform: [{ rotate: '45deg' }],
    },
})
