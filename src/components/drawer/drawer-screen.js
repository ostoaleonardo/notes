import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '../typography'
import { DrawerIconButton } from './drawer-icon-button'
import { ArrowForward } from '@/icons'

export function DrawerScreen({ label, path, indicator, active, onPress }) {
    return (
        <Pressable
            style={styles.container}
            onPress={onPress || (() => router.push(path))}
        >
            <View>
                <Typography
                    bold={active}
                    uppercase
                >
                    {label}
                </Typography>
                {indicator && (
                    <Typography
                        variant='caption'
                        opacity={active ? 0.8 : 0.5}
                    >
                        {indicator}
                    </Typography>
                )}
            </View>

            <DrawerIconButton
                pointerEvents='none'
                importantForAccessibility='no'
                icon={ArrowForward}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 8,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
