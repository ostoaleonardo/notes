import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { ModalOption } from './ModalOption'

const THEMES = ['Orange', 'Violet', 'Teal']

export function Themes() {
    const [isSelected, setIsSelected] = useState(THEMES[0])

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            {THEMES.map((theme) => (
                <ModalOption
                    key={theme}
                    label={theme}
                    onPress={() => setIsSelected(theme)}
                    isSelected={isSelected === theme ? true : false}
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
