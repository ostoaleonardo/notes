import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { ModalOption } from './ModalOption'
import { useTheme } from '../../hooks'

const THEMES = ['Orange', 'Violet', 'Teal']

export function Themes() {
    const { color, changeTheme } = useTheme()
    const [isSelected, setIsSelected] = useState(color)

    const handleTheme = (theme) => {
        changeTheme(theme)
        setIsSelected(theme)
    }

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
                    onPress={() => handleTheme(theme)}
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
