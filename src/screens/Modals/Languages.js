import { useState } from 'react'
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
        <Scroll
            containerStyle={{
                width: '100%',
                paddingBottom: 24,
            }}
        >
            {LANGUAGES.map(({ code, name }) => (
                <ModalOption
                    key={code}
                    label={name}
                    isSelected={isSelected === code}
                    onPress={() => handleLanguage(code)}
                />
            ))}
        </Scroll>
    )
}
