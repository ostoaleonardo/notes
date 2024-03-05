import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { TitleSection } from '../../../src/components'
import { colors, fonts } from '../../../src/constants'

export default function Categories() {
    const { t } = useTranslation()
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleModal = (option) => {
        setIsModalVisible(!isModalVisible)
        setSelected(option)
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionContainer}>
                <TitleSection title={t('drawer.categories')} />
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
