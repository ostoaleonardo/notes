import { forwardRef } from 'react'
import { RadioButton } from 'react-native-paper'
import { ModalSheet, RadioButtonItem } from '@/components'
import { FlatList } from 'react-native-gesture-handler'
import { useLanguage } from '@/hooks'
import { LANGUAGES } from '@/constants'

export const Languages = forwardRef(({ onClose }, ref) => {
    const { currentLanguage, changeLanguage } = useLanguage()

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            snapPoints={['50%', '95%']}
        >
            <RadioButton.Group
                value={currentLanguage}
                onValueChange={changeLanguage}
            >
                <FlatList
                    data={LANGUAGES}
                    keyExtractor={({ code }) => code}
                    contentContainerStyle={{
                        paddingBottom: 16, gap: 2
                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <RadioButtonItem
                            key={item.code}
                            value={item.code}
                            label={item.name}
                            isFirst={index === 0}
                            isLast={index === LANGUAGES.length - 1}
                        />
                    )}
                />
            </RadioButton.Group>
        </ModalSheet>
    )
})
