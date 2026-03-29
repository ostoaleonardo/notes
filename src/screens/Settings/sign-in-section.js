import { useContext, useEffect, useRef } from 'react'
import { ToastAndroid } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useNetInfo } from '@react-native-community/netinfo'
import { statusCodes } from '@react-native-google-signin/google-signin'
import { useAuth, usePremium, useStorage, useSync } from '@/hooks'
import { Avatar, Section } from '@/components'
import { Option } from './option'
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

    const shouldRestoreRef = useRef(false)

    const {
        user,
        isSignedIn,
        signIn,
        signOut
    } = useAuth()

    useEffect(() => {
        if (!isSignedIn) return
        if (!shouldRestoreRef.current) return

        shouldRestoreRef.current = false
        restore()
    }, [isSignedIn])

    const onSignIn = async () => {
        try {
            if (!isInternetReachable) {
                throw { code: 'NO_INTERNET' }
            }

            await signIn()
            shouldRestoreRef.current = true
        } catch (error) {
            ToastAndroid.show(
                getError(error),
                ToastAndroid.SHORT
            )
        }
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

    const getError = (error) => {
        switch (error.code) {
            case 'NO_INTERNET':
                return t('auth.connection')
            case statusCodes.IN_PROGRESS:
                return t('auth.signin.progress')
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                return t('auth.signin.services.unavailable')
            case statusCodes.SIGN_IN_CANCELLED:
                return t('auth.signin.cancelled')
            default:
                return t('auth.signin.failed')
        }
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
