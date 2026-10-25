import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { FontOption } from './font-option'
import { ListItem } from '../../components/list-item'

import { useHeadingFont } from '@/hooks/use-heading-font'
import { useStorage } from '@/hooks/use-storage'

import { HEADING_FONT_FAMILIES, HEADING_FONT_PREVIEW } from '@/constants/heading-fonts'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SPACING } from '@/constants/theme'

const TRANSLATION_KEY = 'settings.general.heading_font'

export function HeadingFontOption() {
    const { t } = useTranslation()
    const { setItem } = useStorage()
    const { fontKey, setFontKey } = useHeadingFont()

    const onSelect = useCallback((value) => {
        setFontKey(value)
        setItem(STORAGE_KEYS.HEADING_FONT, value)
    }, [setFontKey, setItem])

    return (
        <ListItem
            title={t(`${TRANSLATION_KEY}.title`)}
            description={t(`${TRANSLATION_KEY}.description`)}
        >
            <View style={styles.options}>
                {Object.entries(HEADING_FONT_FAMILIES).map(([value, family]) => (
                    <FontOption
                        key={value}
                        fontFamily={family}
                        preview={HEADING_FONT_PREVIEW}
                        active={fontKey === value}
                        onPress={() => onSelect(value)}
                    >
                        {t(`${TRANSLATION_KEY}.${value}`)}
                    </FontOption>
                ))}
            </View>
        </ListItem>
    )
}

const styles = StyleSheet.create({
    options: {
        width: '100%',
        paddingVertical: SPACING.sm,
        marginTop: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    }
})
