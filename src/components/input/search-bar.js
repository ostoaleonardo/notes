import { SearchClearButton } from './search-clear-button'
import { ComposeBox } from '@/ui/compose-box'
import { ComposeIcon } from '@/ui/compose-icon'
import { FilledTextField } from '@/ui/input/filled-text-field'
import { useTheme } from '@/ui/hooks/use-theme'

import { useSearchClear } from '@/hooks/use-search-clear'

import { Search } from '@/icons/search'

import { ICON_SIZE, SIZE } from '@/constants/theme'

export const SearchBar = ({
    label,
    value,
    testID,
    onChangeText
}) => {
    const { colors } = useTheme()
    const { fieldRef, onClear } = useSearchClear(onChangeText)

    return (
        <FilledTextField
            ref={fieldRef}
            testID={testID}
            multiline={false}
            syncWhileFocused
            label={label}
            value={value}
            onChangeText={onChangeText}
            startAdornment={(
                <ComposeBox size={SIZE.sm}>
                    <ComposeIcon
                        icon={Search}
                        size={ICON_SIZE.xxl}
                        color={colors.onSurfaceVariant}
                    />
                </ComposeBox>
            )}
            endAdornment={
                value ? <SearchClearButton onPress={onClear} />
                    : undefined
            }
        />
    )
}
