import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { AppVersionCard, Section, Option, Typography, Separator } from '@/components'
import { ArrowForward } from '@/icons'
import { Languages } from '@/screens'
import { useBottomSheet } from '@/hooks'
import { COLORS } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()
    const { ref, onOpen, onClose } = useBottomSheet()

    return (
        <View style={styles.container}>
            <Section
                title={t('title.language')}
            >
                <Option
                    onPress={onOpen}
                    rightContent={
                        <ArrowForward
                            color={COLORS.white}
                        />
                    }
                >
                    <Typography
                        uppercase
                    >
                        {t('language')}
                    </Typography>
                </Option>
            </Section>

            <Separator style={{ marginHorizontal: 24 }} />

            <Section
                title={t('title.about')}
            >
                <AppVersionCard />
            </Section>

            <Languages
                ref={ref}
                onClose={onClose}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
        paddingVertical: 24
    }
})
