import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RadioButton } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { ModalSheet, RadioButtonItem } from '@/components'
import { useLanguage } from '@/hooks'
import { LANGUAGES } from '@/constants'

export const Languages = forwardRef(({ onClose }, ref) => {
    const { t } = useTranslation()
    const { currentLanguage, changeLanguage } = useLanguage()

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            snapPoints={['50%', '95%']}
            title={t('settings.language')}
            style={{ paddingHorizontal: 16 }}
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
