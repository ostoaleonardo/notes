import { memo } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '../typography'
import { SPACING } from '@/constants/spacing'

export const DrawerNoteItem = memo(function DrawerNoteItem({ note, depth, active, onOpenNote }) {
    return (
        <AnimatedView>
            <Pressable
                accessibilityRole='button'
                accessibilityState={{ selected: !!active }}
                onPress={() => onOpenNote(note.path)}
                style={{
                    ...styles.container,
                    paddingLeft: SPACING.sm + depth * SPACING.lg
                }}
            >
                <Typography
                    bold={active}
                    numberOfLines={1}
                >
                    {note.title}
                </Typography>
            </Pressable>
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.xs,
        paddingRight: SPACING.lg
    }
})
