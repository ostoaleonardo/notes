import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SwipeableCard } from '../SwipeableCard'
import { Typography } from '../../Typography'
import { MarkdownInput } from '../../Markdown'
import { ListItemPreview } from '../Preview/ListItemPreview'
import { PinAction } from '../Actions/PinAction'
import { Skeleton } from './Skeleton'
import { useLocalAuthentication } from '@/hooks'
import { getDimensions, getPreviewNote } from '@/utils'
import { Lock } from '@/icons'
import { ROUTES } from '@/constants'

export function SwipeableNote({ data, onUnlock, isOpen, onOpen, onDelete, onPin }) {
    const { colors } = useTheme()
    const { hasBiometrics } = useLocalAuthentication()

    const { id, title, note, images, list, password, biometrics } = data

    const hasImages = images && images.length > 0
    const hasList = list && list.items && list.items.length > 0
    const isLocked = password || (biometrics && hasBiometrics)
    const hasContent = title || note || hasList || isLocked

    const width = hasImages && getDimensions(images.length)
    const value = getPreviewNote(note)

    const goToEdit = () => {
        if (isLocked) {
            onUnlock(id)
        } else {
            router.push(ROUTES.EDIT_NOTE + id)
        }
    }

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={() => onDelete(data, isLocked)}
            renderLeftActions={() => <PinAction onPress={() => onPin(id)} />}
        >
            <Pressable
                onPress={goToEdit}
                pointerEvents='box-only'
                style={{
                    ...styles.container,
                    backgroundColor: colors.surface
                }}
            >
                <View
                    style={{
                        gap: hasContent ? 16 : 0,
                        padding: hasContent ? 20 : hasImages ? 0 : 20
                    }}
                >
                    {(title || isLocked) && (
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                {title && (
                                    <Typography
                                        bold
                                        variant='caption'
                                    >
                                        {title}
                                    </Typography>
                                )}
                            </View>

                            {isLocked && (
                                <Lock
                                    width={16}
                                    height={16}
                                    color={colors.onBackground}
                                />
                            )}
                        </View>
                    )}

                    {!isLocked && note && <MarkdownInput readOnly value={value} />}

                    {!isLocked && hasList && (
                        <View style={{ width: '100%' }}>
                            {list.items.map((item, index) => (
                                <ListItemPreview
                                    key={item.id}
                                    type={list.type}
                                    index={index + 1}
                                    value={item.value}
                                    status={item.status}
                                />
                            ))}
                        </View>
                    )}

                    {isLocked && <Skeleton />}
                </View>

                {!isLocked && hasImages && (
                    <View style={styles.images}>
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
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden'
    },
    header: {
        width: '100%',
        gap: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    images: {
        width: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    image: {
        aspectRatio: 1
    }
})
