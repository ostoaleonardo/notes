import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { SwipeableCard } from '../swipeable-card'
import { ListItemPreview } from '../preview/list-item-preview'
import { Typography } from '../../typography'
import { MarkdownInput } from '../../markdown'
import { RestoreAction } from '../actions/restore-action'
import { getDimensions, getPreviewNote } from '@/utils'
import { TRASH_RETENTION_DAYS } from '@/constants'

const DAY_MS = 24 * 60 * 60 * 1000

export function SwipeableTrash({ data, isOpen, onOpen, onDelete, onRestore }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const { title, note, images, list, trashedAt } = data

    const hasImages = images && images.length > 0
    const hasList = list && list.items && list.items.length > 0
    const hasContent = title || note || hasList

    const width = hasImages && getDimensions(images.length)
    const preview = getPreviewNote(note)

    const daysRemaining = trashedAt
        ? Math.max(0, TRASH_RETENTION_DAYS - Math.floor((Date.now() - trashedAt) / DAY_MS))
        : null

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

                        {daysRemaining !== null && (
                            <Typography
                                opacity={0.5}
                                variant='caption'
                            >
                                {daysRemaining > 0
                                    ? t('trash.expires', { count: daysRemaining })
                                    : t('trash.expires_today')}
                            </Typography>
                        )}
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
