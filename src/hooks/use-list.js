import { randomUUID } from 'expo-crypto'
import { DEFAULT_ITEM_LIST } from '@/constants'

export function useList(list, setList) {

    const onListType = (type) => {
        if (list && list.type === type) return

        if (list && list.items.length > 0) {
            setList((prev) => ({ ...prev, type }))
        } else {
            onAddItem(type)
        }
    }

    const onListChange = (newItem) => {
        setList((prev) => {
            const items = prev.items.map((item) => {
                if (item.id === newItem.id) {
                    return newItem
                }

                return item
            })

            return { ...prev, items }
        })
    }

    const onAddItem = (type) => {
        const item = { ...DEFAULT_ITEM_LIST, id: randomUUID() }

        setList((prev) => {
            const items = prev ? [...prev.items, item] : [item]
            return { items, type }
        })
    }

    const onDeleteItem = (id) => {
        setList((prev) => {
            const items = prev.items.filter((item) => item.id !== id)

            return {
                items,
                type: items.length > 0 ? prev.type : ''
            }
        })
    }

    return {
        onListChange,
        onAddItem,
        onDeleteItem,
        onListType
    }
}
