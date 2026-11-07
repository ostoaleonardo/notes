import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { Touchable } from '@/ui/touchable'
import { useTheme } from '@/ui/hooks/use-theme'
import { levelRowStyles } from './drawer-level-styles'

import { ArrowBack } from '@/icons/arrow-back'

import { ICON_SIZE, RADIUS, SPACING } from '@/constants/theme'

export const DrawerLevelHeader = memo(({
    repository,
    onBack
}) => {
    const { colors } = useTheme()

    return (
        <View style={styles.container}>
            <View style={styles.back}>
                <Touchable
                    accessibilityRole='button'
                    onPress={onBack}
                    style={[levelRowStyles.touch, levelRowStyles.touchStart]}
                >
                    <View style={levelRowStyles.content}>
                        <View style={levelRowStyles.slot}>
                            <ArrowBack
                                color={colors.onBackground}
                                width={ICON_SIZE.lg}
                                height={ICON_SIZE.lg}
                            />
                        </View>
                        <Typography
                            bold
                            uppercase
                            variant='titleSmall'
                            numberOfLines={1}
                            styleProps={levelRowStyles.label}
                        >
                            {repository.alias}
                        </Typography>
                    </View>
                </Touchable>
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm
    },
    back: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: RADIUS.xl
    }
})
