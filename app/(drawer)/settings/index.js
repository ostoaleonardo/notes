import { SectionListComponent, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../../../src/constants'
import { TitleSection } from '../../../src/components'
import { useState } from 'react'

export default function Settings() {
    const [language, setLanguage] = useState('English')
    const [theme, setTheme] = useState('Orange')

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Settings
            </Text>
            <View style={styles.sectionContainer}>
                <TitleSection title='Language' />
                <View style={styles.cardContainer}>
                    <Text style={styles.label}>
                        {language}
                    </Text>
                    <Text style={styles.label}>
                        {'>'}
                    </Text>
                </View>
            </View>
            <View style={styles.sectionContainer}>
                <TitleSection title='Theme' />
                <View style={styles.cardContainer}>
                    <View style={styles.colorContainer}>
                        <View style={styles.color} />
                        <Text style={styles.label}>
                            {theme}
                        </Text>
                    </View>
                    <Text style={styles.label}>
                        {'>'}
                    </Text>
                </View>
            </View>
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
