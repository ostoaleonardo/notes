import { StorageSelectOption } from './storage-select-option'

export function SelectOptionList({ options }) {
    const lastIndex = options.length - 1

    return options.map((option, index) => (
        <StorageSelectOption
            key={option.storageKey}
            {...option}
            isFirst={index === 0}
            isLast={index === lastIndex}
        />
    ))
}
