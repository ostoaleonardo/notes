import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { ModalOption, Scroll } from '@/components'

const THEMES = ['Orange', 'Violet', 'Teal']

export function Themes() {
    const [isSelected, setIsSelected] = useState(THEMES[0])

    return (
        <Scroll containerStyle={styles.scrollContainer}>
            {THEMES.map((theme) => (
                <ModalOption
                    key={theme}
                    label={theme}
                    onPress={() => setIsSelected(theme)}
                    isSelected={isSelected === theme ? true : false}
                />
            ))}
        </Scroll>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: '100%',
        paddingBottom: 24,
    },
})
