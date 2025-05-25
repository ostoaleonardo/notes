import { forwardRef, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { MarkdownContainer, MarkdownPreview, ModalSheet, Typography } from '@/components'
import { MARKDOWN } from '@/constants'

export const MarkdownTutorial = forwardRef(({ onClose }, ref) => {

    const renderItems = useCallback(({ descrption, example, height }) => (
        <View style={styles.item}>
            <Typography>
                {descrption}
            </Typography>
            <MarkdownPreview
                height={height}
                value={example}
            />
        </View>
    ), [])

    return (
        <ModalSheet
            ref={ref}
            onDismiss={onClose}
            snapPoints={['95%']}
            contentContainerStyle={styles.container}
        >
            <MarkdownContainer>
                ## How to use Markdown
            </MarkdownContainer>
            <View>
                <FlatList
                    data={MARKDOWN}
                    keyExtractor={({ id }) => id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => renderItems(item)}
                    ItemSeparatorComponent={<View style={{ height: 32 }} />}
                    ListFooterComponent={() => <View style={{ height: 96 }} />}
                />
            </View>
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        width: '100%',
        gap: 16,
        paddingHorizontal: 24
    }
})
