import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Typography } from '../typography'
import { useIconProps } from '@/hooks'
import { ArrowForward } from '@/icons'

export function DrawerScreen({ label, path, indicator, active, onPress }) {
    const iconProps = useIconProps(16)

    return (
        <Pressable
            style={styles.container}
            onPress={onPress || (() => router.push(path))}
        >
            <View style={styles.content}>
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

            <ArrowForward
                {...iconProps}
                opacity={0.6}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    content: {
        gap: 4
    }
})
