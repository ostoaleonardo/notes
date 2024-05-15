import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { Button, Scroll, Section, Typography } from '@/components'
import { CategoryCarousel, DateNote, ImageCarousel } from '@/screens'
import { useHeaderTitle, useNotes } from '@/hooks'
import { COLORS } from '@/constants'

export default function ViewNote() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [images, setImages] = useState([])
    const [categoryIds, setCategoryIds] = useState([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)

    useHeaderTitle(t('header.viewNote'))

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
        setImages(note.images)
        setCategoryIds(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)
    }, [slug])

    const handleOpenImage = (index) => {
        setIsGalleryVisible(true)
        setGalleryIndex(index)
    }

    return (
        <View style={styles.container}>
            <Scroll
                contentStyle={styles.scrollContainer}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View style={styles.topContainer}>
                    <View>
                        <Section
                            paddingHorizontal={24}
                        >
                            <Typography
                                bold
                                variant='title'
                            >
                                {title}
                            </Typography>
                        </Section>

                        <DateNote
                            createdAt={createdAt}
                            updatedAt={updatedAt}
                        />

                        {categoryIds.length > 1 && (
                            <Section
                                containerStyle={{ paddingTop: 24 }}
                            >
                                <CategoryCarousel
                                    disabled
                                    categoryIds={categoryIds}
                                />
                            </Section>
                        )}

                        <Section
                            containerStyle={{ paddingTop: 24 }}
                            contentStyle={{ paddingHorizontal: 24 }}
                        >
                            <Typography variant='subtitle'>
                                {note}
                            </Typography>
                        </Section>
                    </View>

                    {images.length > 0 && (
                        <ImageCarousel
                            readOnly
                            images={images}
                            onOpenImage={handleOpenImage}
                        />
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        label={t('button.edit')}
                        onPress={() => router.push('/note/edit/' + slug)}
                    />
                    <Button
                        variant='outline'
                        label={t('button.back')}
                        onPress={() => router.back()}
                    />
                </View>
            </Scroll>

            <ImageView
                imageIndex={galleryIndex}
                visible={isGalleryVisible}
                images={images.map((url) => ({ uri: url }))}
                onRequestClose={() => setIsGalleryVisible(false)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flex: 1,
        paddingVertical: 24,
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 1,
        gap: 40,
        justifyContent: 'space-between',
    },
    buttonContainer: {
        gap: 16,
        marginTop: 32,
        paddingHorizontal: 24,
    }
})
