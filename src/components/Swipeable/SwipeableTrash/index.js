import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SwipeableCard } from '../SwipeableCard'
import { ListItemPreview } from '../Preview/ListItemPreview'
import { Typography } from '../../Typography'
import { MarkdownInput } from '../../Markdown'
import { RestoreAction } from '../Actions/RestoreAction'
import { getDimensions, getPreviewNote } from '@/utils'

export function SwipeableTrash({ data, isOpen, onOpen, onDelete, onRestore }) {
    const { colors } = useTheme()

    const { title, note, images, list } = data

    const hasImages = images && images.length > 0
    const hasList = list && list.items && list.items.length > 0
    const hasContent = title || note || hasList

    const width = hasImages && getDimensions(images.length)
    const preview = getPreviewNote(note)

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={() => onDelete(data)}
            renderLeftActions={() => <RestoreAction onPress={() => onRestore(data)} />}
        >
            <Pressable
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
                    </View>

                    {note && (
                        <MarkdownInput readOnly value={preview} />
                    )}


                    {hasList && (
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
                </View>

                {hasImages && (
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
