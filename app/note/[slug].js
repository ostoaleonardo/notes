import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button } from '../../src/components'
import { useNotes } from '../../src/hooks'
import { colors, fonts } from '../../src/constants'

export default function EditNote() {
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
    }, [slug])

    const handleSave = () => {
        updateNote({
            id: slug,
            title,
            note,
        })

        router.navigate('/')
    }

    return (
        <View style={styles.container}>
            <ScrollView
                overScrollMode='never'
                style={styles.scrollContainer}
            >
                <View style={styles.noteContainer}>
                    <View style={styles.titleContainer}>
                        <TextInput
                            multiline
                            value={title}
                            style={styles.title}
                            placeholder='Your title...'
                            onChangeText={(text) => setTitle(text)}
                            placeholderTextColor={`${colors.text}80`}
                        />
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>
                            Note:
                        </Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            multiline
                            value={note}
                            style={styles.input}
                            placeholder='Type your note here...'
                            onChangeText={(text) => setNote(text)}
                            placeholderTextColor={`${colors.text}80`}
                        />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button
                            label='Save'
                            variant='primary'
                            onPress={handleSave}
                        />
                        <Button
                            label='Cancel'
                            variant='secondary'
                            onPress={() => router.navigate('/')}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    noteContainer: {
        width: '100%',
        padding: 24,
        alignItems: 'flex-start',
    },
    titleContainer: {
        width: '100%',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    labelContainer: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        opacity: 0.8,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    inputContainer: {
        width: '100%',
        minHeight: 200,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.foreground,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    buttonsContainer: {
        width: '100%',
        marginTop: 32,
        gap: 16,
    },
})
