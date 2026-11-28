import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { MessageScreen } from '@/ui/message-screen'

export const Intro = () => {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <MessageScreen
                title={t('notes.intro.title')}
                message={t('notes.intro.subtitle')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
