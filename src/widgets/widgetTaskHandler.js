import { NoteWidget } from './NoteWidget'

const nameToWidget = {
    Note: NoteWidget,
}

export async function widgetTaskHandler(props) {
    const widgetInfo = props.widgetInfo
    const Widget = nameToWidget[widgetInfo.widgetName]

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
            props.renderWidget(
                <Widget
                    title={'Note'}
                    note={'This is a note'}
                />
            )
            break

        case 'WIDGET_UPDATE':
            // Not needed for now
            break

        case 'WIDGET_RESIZED':
            // Not needed for now
            break

        case 'WIDGET_DELETED':
            // Not needed for now
            break

        case 'WIDGET_CLICK':
            // Not needed for now
            break

        default:
            break
    }
}
