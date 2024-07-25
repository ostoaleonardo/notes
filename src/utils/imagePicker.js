import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'

const IMAGE_PICKER_OPTIONS = {
    mediaTypes: MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1
}

export const openImagePicker = async (type) => {
    let result = null

    if (type === 'camera') {
        result = await launchCameraAsync(IMAGE_PICKER_OPTIONS)
    } else if (type === 'gallery') {
        result = await launchImageLibraryAsync(IMAGE_PICKER_OPTIONS)
    }

    if (!result.canceled) {
        return result.assets[0].uri
    }

    return null
}
