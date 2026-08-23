import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton } from 'react-native-paper'
import { Typography } from '../typography'
import { DrawerNoteItem } from './drawer-note-item'
import { useIconProps } from '@/hooks'
import { KeyboardArrowDown, KeyboardArrowUp, Plus } from '@/icons'

export function DrawerTemplatesSection({ templates, activeFilename, collapsed, onToggleCollapse, onOpenTemplate, onAddTemplate }) {
    const { t } = useTranslation()
    const iconProps = useIconProps(16, 0.6)

    return (
        <View>
            <View style={styles.header}>
                <Pressable
                    onPress={onToggleCollapse}
                    style={styles.content}
                >
                    {collapsed
                        ? <KeyboardArrowUp {...iconProps} />
                        : <KeyboardArrowDown {...iconProps} />}
                    <Typography
                        bold
                        uppercase
                        opacity={0.6}
                        variant='caption'
                    >
                        {t('drawer.templates')}
                    </Typography>
                </Pressable>

                <IconButton
                    onPress={onAddTemplate}
                    icon={() => <Plus {...iconProps} />}
                    accessibilityLabel={t('templates.new')}
                />
            </View>

            {!collapsed && templates.map((template) => (
                <DrawerNoteItem
                    key={template.filename}
                    note={{ title: t(`templates.${template.name}`, template.name) }}
                    depth={1}
                    active={template.filename === activeFilename}
                    onPress={() => onOpenTemplate(template.filename)}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingLeft: 8,
        paddingRight: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6
    }
})
