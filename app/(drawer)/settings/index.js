import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { AppVersionCard, Languages, ModalSheet, Section, SettingCard, Typography } from '@/components'
import { colors } from '@/constants'

const SETTINGS_OPTIONS = [
    {
        title: 'settings.language',
        children: <Languages />
    },
]

export default function Settings() {
    const { t } = useTranslation()
    const [selected, setSelected] = useState(SETTINGS_OPTIONS[0])
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleModal = (option) => {
        setIsModalVisible(!isModalVisible)
        setSelected(option)
    }

    return (
        <View style={styles.container}>
            <Section
                title={t('settings.language')}
                contentStyle={{ paddingHorizontal: 24 }}
            >
                <SettingCard
                    rightLabel='>'
                    onPress={() => handleModal(SETTINGS_OPTIONS[0])}
                >
                    <Typography>
                        {t('language')}
                    </Typography>
                </SettingCard>
            </Section>
            <Section
                title={t('settings.about')}
                contentStyle={{ paddingHorizontal: 24 }}
            >
                <AppVersionCard />
            </Section>

            <ModalSheet
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(!isModalVisible)}
                title={t(selected.title)}
            >
                {selected.children}
            </ModalSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
        paddingVertical: 24,
        backgroundColor: colors.background,
    },
})
