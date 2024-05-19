import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { AppVersionCard, ModalSheet, Section, SettingsCard, Typography } from '@/components'
import { Languages } from '@/screens'
import { COLORS } from '@/constants'

const SETTINGS_OPTIONS = [
    {
        title: 'title.language',
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
                title={t('title.language')}
                contentStyle={{ paddingHorizontal: 24 }}
            >
                <SettingsCard
                    rightLabel='>'
                    onPress={() => handleModal(SETTINGS_OPTIONS[0])}
                >
                    <Typography>
                        {t('language')}
                    </Typography>
                </SettingsCard>
            </Section>
            <Section
                title={t('title.about')}
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
        backgroundColor: COLORS.background,
    },
})
