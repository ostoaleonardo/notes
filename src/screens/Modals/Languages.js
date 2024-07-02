import { forwardRef, useState } from 'react'
import { ModalSheet, ModalOption, Separator } from '@/components'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks'
import { LANGUAGES } from '@/constants'

export const Languages = forwardRef(({ onClose }, ref) => {
    const { t } = useTranslation()
    const { currentLanguage, changeLanguage } = useLanguage()
    const [isSelected, setIsSelected] = useState(currentLanguage)

    const handleLanguage = (code) => {
        changeLanguage(code)
        setIsSelected(code)
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            snapPoints={['30%', '40%']}
            title={t('title.language')}
        >
            <FlatList
                data={LANGUAGES}
                keyExtractor={({ code }) => code}
                ItemSeparatorComponent={<Separator style={{ marginHorizontal: 24 }} />}
                renderItem={({ item }) => (
                    <ModalOption
                        label={item.name}
                        isSelected={isSelected === item.code}
                        onPress={() => handleLanguage(item.code)}
                    />
                )}
            />
        </ModalSheet>
    )
})
