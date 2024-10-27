import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RadioButton, useTheme } from 'react-native-paper'
import { MenuContainer } from './MenuContainer'
import { RadioButtonItem } from '../RadioButtonItem'
import { useUtils } from '@/hooks'

export function SortMenu({ anchor, visible, onClose }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { sort, updateSort } = useUtils()
    const { field, order } = sort

    const sortingOptions = [
        'title.asc',
        'title.desc',
        'created.asc',
        'created.desc',
        'updated.asc',
        'updated.desc'
    ]

    const onValueChange = (value) => {
        const [field, order] = value.split('.')
        updateSort({ field, order })
    }

    return (
        <MenuContainer
            mode='single'
            anchor={anchor}
            visible={visible}
            onClose={onClose}
            position='bottom'
        >
            <RadioButton.Group
                value={field + '.' + order}
                onValueChange={onValueChange}
            >
                {sortingOptions.map((value) => (
                    <RadioButtonItem
                        key={value}
                        value={value}
                        label={t('sort.' + value)}
                        color={colors.onBackground}
                        styles={styles.title}
                    />
                ))}
            </RadioButton.Group>
        </MenuContainer>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        marginRight: 16,
        textTransform: 'uppercase'
    }
})
