import { memo } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '../typography'

export const DrawerNoteItem = memo(function DrawerNoteItem({ note, depth, active, onOpenNote }) {
    return (
        <AnimatedView>
            <Pressable
                onPress={() => onOpenNote(note.id)}
                style={{
                    ...styles.container,
                    paddingLeft: 16 + depth * 16
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
        paddingVertical: 6,
        paddingRight: 16
    }
})
