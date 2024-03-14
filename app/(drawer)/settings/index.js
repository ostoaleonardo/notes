import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Languages, ModalSheet, TitleSection } from '@/components'
import { colors, fonts } from '@/constants'

const SETTINGS_OPTIONS = [
    {
        title: 'settings.language',
        children: <Languages />
    },
    // {
    //     title: 'settings.theme',
    //     children: <Themes />
    // }
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
            <View style={styles.sectionContainer}>
                <TitleSection title={t('settings.language')} />
                <Pressable
                    onPress={() => handleModal(SETTINGS_OPTIONS[0])}
                    style={styles.cardContainer}
                >
                    <Text style={styles.label}>
                        {t('language')}
                    </Text>
                    <Text style={styles.label}>
                        {'>'}
                    </Text>
                </Pressable>
            </View>
            <View style={styles.sectionContainer}>
                <TitleSection title={t('settings.about')} />
                <Pressable
                    onPress={() => { }}
                    style={styles.cardContainer}
                >
                    <View>
                        <Text style={styles.label}>
                            {t('settings.checkUpdates')}
                        </Text>
                        <Text style={styles.placeholder}>
                            {t('settings.yourVersion')}
                        </Text>
                    </View>
                    <Text style={styles.label}>
                        1.0.0
                    </Text>
                </Pressable>
            </View>

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
        gap: 8,
        padding: 24,
        backgroundColor: colors.background,
    },
    sectionContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 24,
    },
    cardContainer: {
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.foreground,
    },
    label: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    placeholder: {
        fontSize: 12,
        opacity: 0.6,
        color: colors.text,
        fontFamily: fonts.mono,
    },
})
