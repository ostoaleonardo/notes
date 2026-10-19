import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'
import { levelRowStyles } from './drawer-level-styles'

import { ArrowBack } from '@/icons/arrow-back'

import { RADIUS, ICON_SIZE, SPACING } from '@/constants/theme'

export const DrawerLevelHeader = memo(function DrawerLevelHeader({
    repository,
    onBack
}) {
    const { colors } = useTheme()

    return (
        <View style={styles.container}>
            <View style={styles.back}>
                <TouchableRipple
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
                </TouchableRipple>
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
