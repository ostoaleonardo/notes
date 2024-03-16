import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, PasswordInput, Toast } from '@/components'
import { useHeaderTitle, useNotes } from '@/hooks'
import { colors } from '@/constants'

export default function Password() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote } = useNotes()
    const [password, setPassword] = useState('')
    const [correctPassword, setCorrectPassword] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('title.password'))

    useEffect(() => {
        const note = getNote(slug)
        setCorrectPassword(note.password)
    }, [slug])

    const handlePassword = (password) => {
        if (password === correctPassword) {
            router.push('/note/' + slug)
        } else {
            handleToast(t('messages.wrongPassword'))
        }
    }

    const handleToast = (message) => {
        setMessage(message)
        setTimeout(() => setMessage(''), 3000)
    }

    return (
        <View style={styles.container}>
            <View style={styles.passwordContainer}>
                <PasswordInput
                    value={password}
                    onChangeText={setPassword}
                />
                <View style={styles.buttonsContainer}>
                    <Button
                        label={t('buttons.enter')}
                        onPress={() => handlePassword(password)}
                    />
                    <Button
                        variant='outline'
                        label={t('buttons.cancel')}
                        onPress={() => router.back()}
                    />
                </View>
            </View>
            <Toast message={message} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    passwordContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
        marginTop: 64,
    },
})
