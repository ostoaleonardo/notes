import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { ModalOption } from './ModalOption'

const LANGUAGES = ['English', 'Spanish']

export function Languages() {
    const [isSelected, setIsSelected] = useState(LANGUAGES[0])

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            {LANGUAGES.map((language) => (
                <ModalOption
                    key={language}
                    label={language}
                    onPress={() => setIsSelected(language)}
                    isSelected={isSelected === language ? true : false}
                />
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
})
