import { forwardRef } from 'react'
import { View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'
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
            snapPoints={['50%', '95%']}
            title={t('settings.language')}
        >
            <RadioButton.Group
                value={currentLanguage}
                onValueChange={changeLanguage}
            >
                <FlatList
                    data={LANGUAGES}
                    keyExtractor={({ code }) => code}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={<Separator style={{ marginHorizontal: 24 }} />}
                    ListFooterComponent={() => <View style={{ height: 64 }} />}
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
