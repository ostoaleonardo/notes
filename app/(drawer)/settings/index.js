import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Languages, ModalSheet, Themes, TitleSection } from '../../../src/components'
import { colors, fonts } from '../../../src/constants'

const SETTINGS_OPTIONS = [
    {
        title: 'settings.language',
        children: <Languages />
    },
    {
        title: 'settings.theme',
        children: <Themes />
    }
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
                <TitleSection title={t('settings.theme')} />
                <Pressable
                    onPress={() => handleModal(SETTINGS_OPTIONS[1])}
                    style={styles.cardContainer}
                >
                    <View style={styles.colorContainer}>
                        <View style={styles.color} />
                        <Text style={styles.label}>
                            Orange
                        </Text>
                    </View>
                    <Text style={styles.label}>
                        {'>'}
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
        justifyContent: 'space-between',
        backgroundColor: colors.foreground,
    },
    label: {
        fontSize: 16,
        opacity: 0.8,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    color: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primary,
    }
})
