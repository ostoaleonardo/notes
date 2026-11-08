import { StyleSheet, View } from 'react-native'

import { ComposeBox } from '@/ui/compose-box'
import { ComposeIcon } from '@/ui/compose-icon'
import { FilledTextField } from '@/ui/input/filled-text-field'
import { useTheme } from '@/ui/hooks/use-theme'

import { Search } from '@/icons/search'

import { ICON_SIZE, SIZE, SPACING } from '@/constants/theme'

export const SearchBar = ({
    ref,
    label,
    value,
    testID,
    endAdornment,
    onChangeText
}) => {
    const { colors } = useTheme()

    return (
        <View style={styles.container}>
            <FilledTextField
                ref={ref}
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
                endAdornment={endAdornment}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg
    }
})
