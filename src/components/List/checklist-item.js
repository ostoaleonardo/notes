import { Checkbox, useTheme } from 'react-native-paper'
import { ListContainer } from './list-container'

export function CheckListItem({ item, onDrag, onChange, onDelete, isActive }) {
    const { value, status } = item
    const { colors } = useTheme()
    const { onBackground } = colors

    const isChecked = status === 'checked'

    return (
        <ListContainer
            item={item}
            onDrag={onDrag}
            onChange={onChange}
            onDelete={onDelete}
            isActive={isActive}
        >
            <Checkbox
                label={value}
                status={status}
                color={onBackground}
                onPress={() => onChange({
                    ...item,
                    status: isChecked ? 'unchecked' : 'checked'
                })}
            />
        </ListContainer>
    )
}
