import { ListContainer } from './ListContainer'
import { Typography } from '../Text'

export function NumberedListItem({ index, item, onDrag, onChange, onDelete, isActive }) {
    return (
        <ListContainer
            item={item}
            onDrag={onDrag}
            onChange={onChange}
            onDelete={onDelete}
            isActive={isActive}
        >
            <Typography>{index}.</Typography>
        </ListContainer>
    )
}
