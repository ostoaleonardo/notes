import { useContext, useEffect, useRef } from 'react'
import { ToastAndroid } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useNetInfo } from '@react-native-community/netinfo'
import { useTranslation } from 'react-i18next'
import { Avatar, Section } from '@/components'
import { Option } from './option'
import { useAuth, useNotes, usePremium, useStorage, useSync } from '@/hooks'
import { NoteContext } from '@/context'
import { LogOut } from '@/icons'

export function SignInSection() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { restore } = useSync()
    const { premium } = usePremium()
    const { clear: clearStorage } = useStorage()
    const { isInternetReachable } = useNetInfo()
    const { clear } = useContext(NoteContext)
    const { saveNotesDebug } = useNotes()

    const {
        user,
        isSignedIn,
        accessToken,
        signIn,
        signOut
    } = useAuth()

    const shouldRestoreRef = useRef(false)

    useEffect(() => {
        if (!shouldRestoreRef.current) return
        if (!isSignedIn || !accessToken) return

        shouldRestoreRef.current = false
        restore()
    }, [accessToken, isSignedIn])

    const onSignIn = async () => {
        if (!isInternetReachable) {
            ToastAndroid.show(t('no.connection'), ToastAndroid.SHORT)
            return
        }

        await signIn()
        shouldRestoreRef.current = true
    }

    const onSignOut = async () => {
        clear()
        clearStorage()
        signOut()

        shouldRestoreRef.current = false

        ToastAndroid.show(
            t('account.signout'),
            ToastAndroid.SHORT
        )
    }

    const iconProps = {
        color: colors.onBackground
    }

    return (
        <Section
            visible={premium}
            title={t('title.account')}
            containerStyle={{ paddingHorizontal: 16 }}
            contentStyle={{ gap: 3 }}
        >
            <Option
                visible={!isSignedIn}
                title={t('account.signin')}
                description={t('account.signin.description')}
                rightContent={<LogOut {...iconProps} />}
                onPress={onSignIn}
                isFirst={!isSignedIn}
                isLast={!isSignedIn}
            />
            <Option
                visible={isSignedIn}
                title={user?.name}
                description={user?.email}
                rightContent={<Avatar user={user} size={32} />}
                onPress={() => saveNotesDebug(15)}
                isFirst={isSignedIn}
            />
            <Option
                visible={isSignedIn}
                title={t('account.signout')}
                description={t('account.signout.description')}
                rightContent={<LogOut {...iconProps} />}
                onPress={onSignOut}
                isLast={isSignedIn}
            />
        </Section>
    )
}
