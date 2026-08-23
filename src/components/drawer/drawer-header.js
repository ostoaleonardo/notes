import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { DrawerIconButton } from './drawer-icon-button'
import { Typography } from '../typography'
import { ArrowForward, CollapseAll, ExpandAll } from '@/icons'
import { ROUTES } from '@/constants'

export function DrawerHeader({ collapsed, onToggleCollapseAll }) {
    const { t } = useTranslation()

    return (
        <Pressable
            style={styles.container}
            onPress={() => router.push(ROUTES.REPOSITORIES)}
            accessibilityLabel={t('drawer.repositories')}
        >
            <Typography
                opacity={0.6}
                uppercase={true}
                variant='caption'
            >
                {t('drawer.repositories')}
            </Typography>

            <View style={styles.actions}>
                <DrawerIconButton
                    onPress={onToggleCollapseAll}
                    icon={collapsed ? ExpandAll : CollapseAll}
                    accessibilityLabel={t(collapsed ? 'drawer.expand_all' : 'drawer.collapse_all')}
                />
                <DrawerIconButton
                    pointerEvents='none'
                    importantForAccessibility='no'
                    icon={ArrowForward}
                />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})
