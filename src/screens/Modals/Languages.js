import { forwardRef } from 'react'
import { FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet, ModalOption, Separator } from '@/components'
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
            <FlatList
                data={LANGUAGES}
                keyExtractor={({ code }) => code}
                ItemSeparatorComponent={<Separator style={{ marginHorizontal: 24 }} />}
                renderItem={({ item }) => (
                    <ModalOption
                        label={item.name}
                        isSelected={currentLanguage === item.code}
                        onPress={() => changeLanguage(item.code)}
                    />
                )}
            />
        </ModalSheet>
    )
})
