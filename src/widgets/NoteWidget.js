import { FlexWidget, TextWidget } from 'react-native-android-widget'
import { COLORS } from '@/constants'

export function NoteWidget({ title, note }) {
    return (
        <FlexWidget
            clickAction='OPEN_APP'
            style={{
                width: 'wrap_content',
                height: 'wrap_content',
                padding: 20,
                borderRadius: 16,
                justifyContent: 'center',
                backgroundColor: COLORS.foreground,
            }}
        >
            <TextWidget
                text={title || 'Note'}
                style={{
                    fontSize: 14,
                    color: COLORS.text,
                    fontFamily: 'RobotoMono',
                }}
            />
            <TextWidget
                text={note || 'This is a note'}
                style={{
                    fontSize: 14,
                    color: COLORS.text,
                    fontFamily: 'RobotoMono',
                }}
            />
        </FlexWidget>
    )
}
