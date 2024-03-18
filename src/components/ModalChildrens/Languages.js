import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { ModalOption } from './ModalOption'
import { useLanguage } from '@/hooks'
import { LANGUAGES, colors } from '@/constants'

export function Languages() {
    const { currentLanguage, changeLanguage } = useLanguage()
    const [isSelected, setIsSelected] = useState(currentLanguage)

    const handleLanguage = (code) => {
        changeLanguage(code)
        setIsSelected(code)
    }

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            {LANGUAGES.map(({ code, name }) => (
                <ModalOption
                    key={code}
                    label={name}
                    onPress={() => handleLanguage(code)}
                    isSelected={isSelected === code ? true : false}
                />
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: '100%',
        paddingBottom: 24,
    },
})
