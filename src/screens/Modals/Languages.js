import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { ModalOption, Scroll } from '@/components'
import { useLanguage } from '@/hooks'
import { LANGUAGES } from '@/constants'

export function Languages() {
    const { currentLanguage, changeLanguage } = useLanguage()
    const [isSelected, setIsSelected] = useState(currentLanguage)

    const handleLanguage = (code) => {
        changeLanguage(code)
        setIsSelected(code)
    }

    return (
        <Scroll containerStyle={styles.scrollContainer}>
            {LANGUAGES.map(({ code, name }) => (
                <ModalOption
                    key={code}
                    label={name}
                    onPress={() => handleLanguage(code)}
                    isSelected={isSelected === code ? true : false}
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
