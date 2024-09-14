import { useCallback, useEffect, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { useFocusEffect } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, Section, TextArea } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, ImageCarousel, List, Reminder } from '@/screens'
import { useBottomSheet, useNotes, useNotifications } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_CATEGORIES } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote, updateNote } = useNotes()
    const { scheduleNotification } = useNotifications()

    const [isSaved, setIsSaved] = useState(false)
    const [firstRender, setFirstRender] = useState(true)

    const [id, setId] = useState(randomUUID())
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map(({ id }) => id))
    const [images, setImages] = useState([])
    const [list, setList] = useState({ type: '', items: [] })
    const [reminder, setReminder] = useState({ date: null, repeat: 'never' })

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)

    const {
        ref: categoriesBottomRef,
        onOpen: onOpenCategories,
        onClose: onCloseCategories
    } = useBottomSheet()

    const {
        ref: passwordBottomRef,
        onOpen: onOpenPassword,
        onClose: onClosePassword
    } = useBottomSheet()

    const [isReminderVisible, setIsReminderVisible] = useState(false)

    const onOpenReminder = () => setIsReminderVisible(true)
    const onCloseReminder = () => setIsReminderVisible(false)
    const onDeleteReminder = () => setReminder({ date: null, repeat: 'never' })

    useFocusEffect(
        useCallback(() => {
            setFirstRender(false)
        }, [])
    )

    useEffect(() => {
        if (firstRender) return

        const timer = setTimeout(() => {
            const newData = {
                id,
                title: title.trim(),
                note: note.trim(),
                categories,
                images,
                list,
                password,
                biometrics
            }

            if (!isSaved) {
                saveNote({
                    ...newData,
                    createdAt: getDate()
                })

                setIsSaved(true)
            } else {
                updateNote({
                    ...newData,
                    updatedAt: getDate()
                })
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [
        title,
        note,
        categories,
        images,
        list,
        reminder,
        password,
        biometrics
    ])

    const handleCategories = (id) => {
        if (!categories.includes(id)) {
            setCategories([...categories, id])
        } else {
            setCategories(categories.filter((categoryId) => categoryId !== id))
        }
    }

    const handleAddImage = (image) => {
        setImages([...images, image])
    }

    const handleOpenImage = (index) => {
        setIsGalleryVisible(true)
        setGalleryIndex(index)
    }

    const handleListType = (type) => {
        if (list && list.type === type) return

        if (list.items.length > 0) {
            setList((prev) => ({ ...prev, type }))
        } else {
            handleAddItem(type)
        }
    }

    const handleAddItem = (type) => {
        const item = {
            id: randomUUID(),
            value: '',
            status: 'unchecked'
        }

        setList((prev) => {
            const items = [...prev.items, item]
            return { items, type }
        })
    }

    return (
        <>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <View style={styles.contentContainer}>
                    <View>
                        <Section
                            paddingHorizontal={24}
                        >
                            <LargeInput
                                bold
                                multiline
                                value={title}
                                onChangeText={setTitle}
                                placeholder={t('placeholder.title')}
                            />
                        </Section>

                        <Section
                            title={t('title.categories')}
                            paddingVertical={24}
                        >
                            <CategoryCarousel
                                selectedCategories={categories}
                                onCategories={handleCategories}
                                onCategoriesModal={onOpenCategories}
                            />
                        </Section>

                        <Section
                            paddingHorizontal={24}
                        >
                            <TextArea
                                value={note}
                                onChangeText={setNote}
                                placeholder={t('placeholder.note')}
                            />
                        </Section>

                        {list.items.length > 0 && (
                            <Section
                                paddingVertical={24}
                            >
                                <List
                                    list={list}
                                    setList={setList}
                                    onAddItem={handleAddItem}
                                />
                            </Section>
                        )}
                    </View>

                    {images.length > 0 && (
                        <ImageCarousel
                            images={images}
                            setImages={setImages}
                            onOpenImage={handleOpenImage}
                        />
                    )}
                </View>
            </NestableScrollContainer>

            <BottomOptionsBar
                onAddImage={handleAddImage}
                onListType={handleListType}
                password={{
                    hasPassword: !!password,
                    onOpenPassword
                }}
                reminder={{
                    hasReminder: !!reminder,
                    onOpenReminder,
                    onCloseReminder,
                    onDeleteReminder
                }}
            />

            <Categories
                ref={categoriesBottomRef}
                onClose={onCloseCategories}
                selectedCategories={categories}
                handleCategories={handleCategories}
            />
            <AddPassword
                ref={passwordBottomRef}
                onClose={onClosePassword}
                setPassword={setPassword}
                biometrics={biometrics}
                setBiometrics={setBiometrics}
            />
            <Reminder
                visible={isReminderVisible}
                onClose={onCloseReminder}
                reminder={reminder}
                setReminder={setReminder}
            />
            <ImageView
                imageIndex={galleryIndex}
                visible={isGalleryVisible}
                images={images.map((url) => ({ uri: url }))}
                onRequestClose={() => setIsGalleryVisible(false)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 16
    },
    contentContainer: {
        flex: 1,
        gap: 40,
        paddingBottom: 48,
        justifyContent: 'space-between'
    }
})
