import { RadioButton } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { RadioButtonItem } from '@/components'
import { useLanguage } from '@/hooks'
import { LANGUAGES } from '@/constants'

export function Languages() {
    const { currentLanguage, changeLanguage } = useLanguage()

    return (
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
    )
}
