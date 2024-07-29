import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SwipeableCard } from '../SwipeableCard'
import { Typography } from '../../Text'
import { CheckBoxItemPreview } from './CheckBoxItemPreview'
import { Skeleton } from './Skeleton'
import { useLocalAuthentication } from '@/hooks'
import { getDimensions } from '@/utils'
import { Lock } from '@/icons'
import { ROUTES } from '@/constants'

export function SwipeableNote({ data, isOpen, onOpen, onDelete }) {
    const { colors } = useTheme()
    const { hasBiometrics } = useLocalAuthentication()
    const { id, title, note, images, list, password, biometrics } = data
    const isLocked = password || (biometrics && hasBiometrics)
    const width = getDimensions(images.length)

    const goToEdit = () => {
        if (isLocked) {
            router.push(ROUTES.UNLOCK_NOTE + id)
        } else {
            router.push(ROUTES.EDIT_NOTE + id)
        }
    }

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={() => onDelete(id, isLocked)}
        >
            <Pressable
                onPress={goToEdit}
                style={[
                    styles.container,
                    { backgroundColor: colors.surface }
                ]}
            >
                <View style={styles.headerContainer}>
                    <View style={{ flex: 1 }}>
                        <Typography
                            bold
                            uppercase
                            variant='caption'
                        >
                            {title}
                        </Typography>
                    </View>

                    {isLocked && (
                        <Lock
                            width={16}
                            height={16}
                            color={colors.onBackground}
                        />
                    )}
                </View>

                {!isLocked && (
                    <View style={{ width: '100%', gap: 12 }}>
                        <Typography
                            variant='caption'
                            numberOfLines={5}
                        >
                            {note}
                        </Typography>

                        {list && list.length > 0 && (
                            <View>
                                {list.map((item) => (
                                    <CheckBoxItemPreview
                                        key={item.id}
                                        value={item.value}
                                        status={item.status}
                                    />
                                ))}
                            </View>
                        )}

                        {images && images.length > 0 && (
                            <View style={styles.imagesContainer}>
                                {images.slice(0, 3).map((image, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: image }}
                                        style={[styles.image, {
                                            width: width + '%',
                                            height: width + '%'
                                        }]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {isLocked && <Skeleton />}
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: '100%',
        gap: 16,
        padding: 20,
        borderRadius: 16
    },
    headerContainer: {
        gap: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    imagesContainer: {
        width: '100%',
        gap: 8,
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    image: {
        aspectRatio: 1,
        borderRadius: 16
    }
})
