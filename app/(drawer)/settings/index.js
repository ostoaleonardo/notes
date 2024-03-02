import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Languages, ModalSheet, TitleSection } from '../../../src/components'
import { colors, fonts } from '../../../src/constants'

const SETTINGS_OPTIONS = [
    {
        title: 'Language',
        component: <Languages />
    },
    // {
    //     title: 'Themes',
    //     component: <Themes />
    // }
]

export default function Settings() {
    const [selected, setSelected] = useState(SETTINGS_OPTIONS[0])
    const [language, setLanguages] = useState('English')
    // const [theme, setTheme] = useState('Orange')
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Settings
            </Text>
            <View style={styles.sectionContainer}>
                <TitleSection title='Language' />
                <Pressable
                    onPress={handleModal}
                    style={styles.cardContainer}
                >
                    <Text style={styles.label}>
                        {language}
                    </Text>
                    <Text style={styles.label}>
                        {'>'}
                    </Text>
                </Pressable>
            </View>
            {/* <View style={styles.sectionContainer}>
                <TitleSection title='Theme' />
                <Pressable
                    onPress={handleModal}
                    style={styles.cardContainer}
                >
                    <View style={styles.colorContainer}>
                        <View style={styles.color} />
                        <Text style={styles.label}>
                            {theme}
                        </Text>
                    </View>
                    <Text style={styles.label}>
                        {'>'}
                    </Text>
                </Pressable>
            </View> */}

            <ModalSheet
                isVisible={isModalVisible}
                onClose={handleModal}
                title={selected.title}
            >
                {selected.component}
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
    title: {
        fontSize: 24,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    sectionContainer: {
        width: '100%',
        gap: 16,
        marginTop: 24,
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
