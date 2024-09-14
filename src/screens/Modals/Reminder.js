import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Modal, Portal, useTheme } from 'react-native-paper'
import DateTimePicker from 'react-native-ui-datepicker'
import { RepeatMenu } from '../Menus'
import { Button, Typography } from '@/components'
import { useLanguage } from '@/hooks'
import { ChevronLeft, ChevronRight, Repeat } from '@/icons'
import { FONTS } from '@/constants'

export function Reminder({ visible, onClose, reminder, setReminder }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { currentLanguage } = useLanguage()

    const [repeat, setRepeat] = useState('never')
    const [repeatVisible, setRepeatVisible] = useState(false)

    const currentDate = new Date()
    const minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={{
                    borderRadius: 24,
                    overflow: 'hidden',
                    marginHorizontal: 24,
                    backgroundColor: colors.surface
                }}
            >
                <View style={styles.container}>
                    <Typography
                        bold
                        uppercase
                        opacity={0.5}
                        variant='caption'
                    >
                        {reminder ? t('reminder.edit') : t('reminder.add')}
                    </Typography>

                    <DateTimePicker
                        timePicker
                        mode='single'
                        minDate={minDate}
                        date={reminder || currentDate}
                        onChange={(params) => {
                            setReminder(params.date)
                        }}

                        locale={currentLanguage}
                        headerButtonsPosition='around'
                        selectedItemColor={colors.tertiary}
                        calendarTextStyle={{
                            color: colors.onSurface,
                            fontFamily: FONTS.azeretLight
                        }}
                        headerContainerStyle={{
                            marginTop: 32
                        }}
                        headerTextStyle={{
                            fontWeight: 'normal',
                            color: colors.onSurface,
                            fontFamily: FONTS.azeretLight
                        }}
                        buttonPrevIcon={<ChevronLeft color={colors.onSurface} />}
                        buttonNextIcon={<ChevronRight color={colors.onSurface} />}

                        selectedTextStyle={{
                            color: colors.onTertiary,
                            fontFamily: FONTS.azeretMedium
                        }}
                        yearContainerStyle={{
                            borderWidth: 0,
                            borderRadius: 8,
                            backgroundColor: colors.outlineVariant
                        }}
                        monthContainerStyle={{
                            borderWidth: 0,
                            borderRadius: 8,
                            backgroundColor: colors.outlineVariant
                        }}
                        weekDaysTextStyle={{
                            color: colors.onSurface,
                            fontFamily: FONTS.azeretMedium
                        }}

                        // Time Picker
                        timePickerContainerStyle={{
                            width: 64
                        }}
                        timePickerTextStyle={{
                            fontSize: 24,
                            fontWeight: 'normal',
                            color: colors.onSurface,
                            fontFamily: FONTS.azeretLight
                        }}
                        timePickerIndicatorStyle={{
                            borderRadius: 16,
                            backgroundColor: colors.outlineVariant
                        }}
                    />

                    <View style={styles.option}>
                        <View style={styles.titleOption}>
                            <Repeat color={colors.onSurface} />
                            <Typography
                                bold
                                uppercase
                                variant='caption'
                            >
                                {t('reminder.repeat')}
                            </Typography>
                        </View>
                        <RepeatMenu
                            visible={repeatVisible}
                            setVisible={setRepeatVisible}
                            repeat={repeat}
                            setRepeat={setRepeat}
                        />
                    </View>

                    <View style={styles.buttons}>
                        <Button
                            autoWidth
                            variant='flat'
                            onPress={onClose}
                            label={t('button.cancel')}
                        />
                        <Button
                            autoWidth
                            onPress={onClose}
                            label={t('button.save')}
                        />
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    option: {
        width: '95%',
        gap: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    titleOption: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttons: {
        width: '100%',
        gap: 16,
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
})
