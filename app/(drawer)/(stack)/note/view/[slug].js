import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { Button, LargeInput, Scroll, Section, TextArea } from '@/components'
import { CategoryCarousel, DateNote, ImageCarousel } from '@/screens'
import { useHeaderTitle, useNotes } from '@/hooks'

export default function ViewNote() {
    const router = useRouter()
    const { t } = useTranslation()
    const { getNote } = useNotes()
    const { slug } = useLocalSearchParams()

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [images, setImages] = useState([])
    const [categories, setCategories] = useState([])
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
        setCategories(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)
    }, [slug])

    const handleOpenImage = (index) => {
        setIsGalleryVisible(true)
        setGalleryIndex(index)
    }

    return (
        <View style={{ flex: 1 }}>
            <Scroll contentContainerStyle={styles.scrollContainer}>
                <View style={styles.topContainer}>
                    <View>
                        <Section
                            paddingHorizontal={24}
                        >
                            <LargeInput
                                bold
                                readOnly
                                multiline
                                value={title}
                            />
                        </Section>

                        <DateNote
                            createdAt={createdAt}
                            updatedAt={updatedAt}
                        />

                        {categories.length > 1 && (
                            <Section
                                containerStyle={{ paddingTop: 32 }}
                            >
                                <CategoryCarousel
                                    disabled
                                    selectedCategories={categories}
                                />
                            </Section>
                        )}

                        <Section
                            paddingVertical={24}
                            paddingHorizontal={24}
                        >
                            <TextArea
                                readOnly
                                value={note}
                            />
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
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 24
    },
    topContainer: {
        flex: 1,
        gap: 40,
        justifyContent: 'space-between'
    },
    buttonContainer: {
        gap: 16,
        marginTop: 32,
        paddingHorizontal: 24
    }
})
