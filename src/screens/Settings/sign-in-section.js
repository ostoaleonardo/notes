import { ToastAndroid } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Section } from '@/components'
import { Option } from '@/screens'
import { useStorage } from '@/hooks'
import { LogOut } from '@/icons'

import { useAuth } from '@/hooks/use-auth'
import { Avatar } from '@/components/avatar'
import { usePremium } from '@/hooks/use-premium'

export function SignInSection() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { clear } = useStorage()
    const { premium } = usePremium()
    const { user, isSignedIn, signIn, signOut } = useAuth()

    const onSignIn = async () => {
        await signIn()
    }

    const onSignOut = async () => {
        clear()
        signOut()
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
