import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AnimatedView } from '@/ui/animated/animated-view'
import { MessageScreen } from '@/ui/message-screen'

export const Intro = () => {
    const { t } = useTranslation()

    return (
        <AnimatedView style={styles.container}>
            <MessageScreen
                title={t('notes.intro.title')}
                message={t('notes.intro.subtitle')}
            />
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
