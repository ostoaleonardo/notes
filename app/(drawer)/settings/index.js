import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { AppVersionCard, Section, Option, Typography } from '@/components'
import { ArrowForward } from '@/icons'
import { COLORS } from '@/constants'

export default function Settings() {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <Section
                title={t('title.language')}
            >
                <Option
                    rightContent={
                        <ArrowForward
                            color={COLORS.text}
                        />
                    }
                    onPress={() => router.push({
                        pathname: 'modal',
                        params: {
                            section: 'settings',
                            modal: 'language'
                        }
                    })}
                >
                    <Typography
                        uppercase
                    >
                        {t('language')}
                    </Typography>
                </Option>
            </Section>

            <View
                style={{
                    height: 1,
                    marginHorizontal: 24,
                    backgroundColor: COLORS.text10
                }}
            />

            <Section
                title={t('title.about')}
            >
                <AppVersionCard />
            </Section>
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
