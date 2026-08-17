import { forwardRef, useImperativeHandle } from 'react'
import { Host, OutlinedTextField, Text, useNativeState } from '@expo/ui/jetpack-compose'
import { FONTS } from '@/constants'

const defaultTextStyle = { fontFamily: FONTS.azeretLight }

export const AndroidOutlinedTextField = forwardRef((props, ref) => {
    const {
        value: valueProp,
        defaultValue = '',
        onValueChange,
        onChangeText,
        label,
        placeholder,
        textStyle,
        style,
        ...rest
    } = props

    // For uncontrolled usage, use native state (Jetpack Compose)
    const nativeState = valueProp === undefined ? useNativeState(defaultValue) : null

    const valueForField = nativeState !== null ? nativeState : valueProp

    useImperativeHandle(ref, () => ({
        getValue: () => {
            if (valueProp !== undefined) return valueProp
            try { return nativeState?.value ?? '' } catch (e) { return '' }
        },
        setValue: (v) => {
            try {
                if (nativeState && typeof nativeState.setValue === 'function') {
                    nativeState.setValue(v)
                    return
                }
            } catch (e) { }

            onValueChange && onValueChange(v)
            onChangeText && onChangeText(v)
        }
    }), [valueProp, nativeState, onValueChange, onChangeText])

    return (
        <Host matchContents>
            <OutlinedTextField
                value={valueForField}
                onValueChange={valueProp !== undefined ? onValueChange : undefined}
                textStyle={{ ...defaultTextStyle, ...textStyle }}
                style={style}
                {...rest}
            >
                {label ? (
                    <OutlinedTextField.Label>
                        {typeof label === 'string'
                            ? <Text style={{ ...defaultTextStyle }}>{label}</Text>
                            : label
                        }
                    </OutlinedTextField.Label>
                ) : null}

                {placeholder ? (
                    <OutlinedTextField.Placeholder>
                        {typeof placeholder === 'string'
                            ? <Text style={{ ...defaultTextStyle }}>{placeholder}</Text>
                            : placeholder
                        }
                    </OutlinedTextField.Placeholder>
                ) : null}
            </OutlinedTextField>
        </Host>
    )
})
