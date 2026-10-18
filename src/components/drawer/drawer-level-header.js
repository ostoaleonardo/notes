import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'
import { levelRowStyles } from './drawer-level-styles'

import { ArrowBack } from '@/icons/arrow-back'
import { FolderCode } from '@/icons/folder-code'

import { DRAWER_ITEM } from '@/constants/components'

export const DrawerLevelHeader = memo(function DrawerLevelHeader({
    repository,
    isRoot,
    onBack
}) {
    const { colors } = useTheme()

    const Icon = isRoot ? FolderCode : ArrowBack

    return (
        <View style={styles.container}>
            <View style={styles.back}>
                <TouchableRipple
                    accessibilityRole='button'
                    disabled={isRoot}
                    onPress={onBack}
                    style={[levelRowStyles.touch, levelRowStyles.touchStart]}
                >
                    <View style={levelRowStyles.content}>
                        <View style={levelRowStyles.slot}>
                            <Icon
                                color={colors.onBackground}
                                width={DRAWER_ITEM.iconSize}
                                height={DRAWER_ITEM.iconSize}
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
        marginBottom: DRAWER_ITEM.sectionGap
    },
    back: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: DRAWER_ITEM.radius
    }
})
