import { ModalSheet } from '@/components'
import { TemplatePicker } from './template-picker'

export function TemplatePickerSheet({ sheet, title, templates, onSelect }) {
    return (
        <ModalSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <TemplatePicker
                title={title}
                templates={templates}
                onSelect={onSelect}
            />
        </ModalSheet>
    )
}
