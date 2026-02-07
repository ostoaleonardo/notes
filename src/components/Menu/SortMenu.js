import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Appbar, RadioButton, Tooltip, useTheme } from 'react-native-paper'
import { MenuContainer } from './MenuContainer'
import { RadioButtonItem } from '../RadioButtonItem'
import { useUtils } from '@/hooks'
import { Sort } from '@/icons'

export function SortMenu({ visible, onOpen, onClose }) {
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
            visible={visible}
            onClose={onClose}
            position='bottom'
            anchor={
                <Tooltip title={t('title.sort')}>
                    <Appbar.Action
                        animated={false}
                        onPress={onOpen}
                        icon={() => <Sort color={colors.onBackground} />}
                    />
                </Tooltip>
            }
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
