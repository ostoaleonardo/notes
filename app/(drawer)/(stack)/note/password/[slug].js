import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { Button, PasswordInput, Toast } from '@/components'
import { useHeaderTitle, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { COLORS } from '@/constants'

export default function Password() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote } = useNotes()
    const [password, setPassword] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('header.password'))

    useEffect(() => {
        const note = getNote(slug)
        setEncryptedPassword(note.password)
    }, [slug])

    useEffect(() => {
        (async () => {
            const digest = await getEncryptedPassword(password)
            setEncryptedInput(digest)
        })()
    }, [password])

    const handlePassword = () => {
        if (encryptedInput === encryptedPassword) {
            router.push('/note/' + slug)
        } else {
            setIsWrongPassword(true)
            handleToast(t('message.wrongPassword'))
        }
    }

    const handleToast = (message) => {
        setMessage(message)
        setTimeout(() => setMessage(''), 3000)
    }

    return (
        <View style={styles.container}>
            <View style={styles.passwordContainer}>
                <Animatable.View
                    animation={isWrongPassword ? 'shake' : undefined}
                    onAnimationEnd={() => setIsWrongPassword(false)}

                >
                    <PasswordInput
                        autoFocus
                        value={password}
                        onChangeText={setPassword}
                        onBlur={() => setMessage('')}
                    />
                </Animatable.View>
                <View style={styles.buttonsContainer}>
                    <Button
                        onPress={handlePassword}
                        label={t('button.enter')}
                    />
                    <Button
                        variant='outline'
                        label={t('button.cancel')}
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
        backgroundColor: COLORS.background,
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
