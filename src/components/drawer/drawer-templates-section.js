import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '../typography'
import { DrawerNoteItem } from './drawer-note-item'
import { DrawerIconButton } from './drawer-icon-button'
import { CollapseAll, ExpandAll, Plus } from '@/icons'

export function DrawerTemplatesSection({ templates, activeFilename, collapsed, onToggleCollapse, onOpenTemplate, onAddTemplate }) {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    onPress={onToggleCollapse}
                    style={styles.content}
                >
                    <Typography
                        opacity={0.6}
                        uppercase={true}
                        variant='caption'
                    >
                        {t('drawer.templates')}
                    </Typography>
                </Pressable>

                <View style={styles.actions}>
                    <DrawerIconButton
                        onPress={onToggleCollapse}
                        icon={collapsed ? ExpandAll : CollapseAll}
                        accessibilityLabel={
                            t(collapsed ? 'drawer.expand_all' : 'drawer.collapse_all')
                        }
                    />
                    <DrawerIconButton
                        onPress={onAddTemplate}
                        icon={Plus}
                        accessibilityLabel={t('templates.new')}
                    />
                </View>
            </View>

            {!collapsed && templates.map((template) => (
                <DrawerNoteItem
                    depth={0}
                    key={template.filename}
                    note={{ title: t(`templates.${template.name}`, template.name) }}
                    active={template.filename === activeFilename}
                    onPress={() => onOpenTemplate(template.filename)}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 8
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})
