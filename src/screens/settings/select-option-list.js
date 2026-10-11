import { StorageSelectOption } from './storage-select-option'

export function SelectOptionList({ options, isLast = true }) {
    const lastIndex = options.length - 1

    return options.map((option, index) => (
        <StorageSelectOption
            key={option.storageKey}
            {...option}
            isFirst={index === 0}
            isLast={isLast && index === lastIndex}
        />
    ))
}
