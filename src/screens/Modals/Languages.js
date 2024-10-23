import { forwardRef } from 'react'
import { FlatList } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { ModalSheet, RadioButtonItem, Separator } from '@/components'
import { useLanguage } from '@/hooks'
import { LANGUAGES } from '@/constants'

export const Languages = forwardRef(({ onClose }, ref) => {
    const { t } = useTranslation()
    const { currentLanguage, changeLanguage } = useLanguage()

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            title={t('settings.language')}
            contentContainerStyle={{ paddingBottom: 80 }}
        >
            <RadioButton.Group
                value={currentLanguage}
                onValueChange={changeLanguage}
            >
                <FlatList
                    data={LANGUAGES}
                    keyExtractor={({ code }) => code}
                    ItemSeparatorComponent={<Separator style={{ marginHorizontal: 24 }} />}
                    renderItem={({ item }) => (
                        <RadioButtonItem
                            key={item.code}
                            value={item.code}
                            label={item.name}
                            styles={{ padding: 8 }}
                        />
                    )}
                />
            </RadioButton.Group>
        </ModalSheet>
    )
})
