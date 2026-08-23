import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { IconButton } from 'react-native-paper'
import { Typography } from '../typography'
import { useIconProps } from '@/hooks'
import { ArrowForward, CollapseAll, ExpandAll } from '@/icons'
import { ROUTES } from '@/constants'

export function DrawerHeader({ collapsed, onToggleCollapseAll }) {
    const { t } = useTranslation()
    const iconProps = useIconProps(16, 0.6)

    return (
        <Pressable
            style={styles.container}
            onPress={() => router.push(ROUTES.REPOSITORIES)}
            accessibilityLabel={t('drawer.repositories')}
        >
            <Typography
                bold
                uppercase
                opacity={0.6}
                variant='caption'
            >
                {t('drawer.repositories')}
            </Typography>

            <View style={styles.actions}>
                <IconButton
                    onPress={onToggleCollapseAll}
                    icon={() => (
                        collapsed
                            ? <ExpandAll {...iconProps} />
                            : <CollapseAll {...iconProps} />
                    )}
                    accessibilityLabel={t(collapsed ? 'drawer.expand_all' : 'drawer.collapse_all')}
                />
                <IconButton
                    pointerEvents='none'
                    importantForAccessibility='no'
                    icon={() => <ArrowForward {...iconProps} />}
                />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 16,
        paddingRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})
