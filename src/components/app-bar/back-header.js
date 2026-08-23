import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Typography } from '../typography'
import { useIconProps } from '@/hooks'
import { ArrowBack } from '@/icons'
import { FONTS } from '@/constants'

export function BackHeader({ title, trailing }) {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const { top } = useSafeAreaInsets()

    return (
        <View style={{ ...styles.container, paddingTop: top + 16 }}>
            <View style={styles.leading}>
                <Tooltip title={t('button.back')}>
                    <Pressable
                        onPress={() => router.back()}
                        hitSlop={8}
                        accessibilityLabel={t('button.back')}
                    >
                        <ArrowBack {...iconProps} />
                    </Pressable>
                </Tooltip>

                <Typography
                    bold
                    variant='title'
                    styleProps={{ fontFamily: FONTS.nType82Headline }}
                >
                    {title}
                </Typography>
            </View>

            {trailing}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    leading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    }
})
