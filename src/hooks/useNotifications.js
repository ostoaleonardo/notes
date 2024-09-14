import { useState, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { COLORS } from '@/constants'

const NOTIFICATION_CONTENT = {
    title: '✨ You\'ve got a reminder!',
    body: 'Don\'t forget to complete your task!'
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
    })
})

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('')
    const [channels, setChannels] = useState([])
    const [notification, setNotification] = useState(undefined)

    const notificationListener = useRef()
    const responseListener = useRef()

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => token && setExpoPushToken(token))

        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync()
                .then(value => setChannels(value ?? []))
        }

        notificationListener.current = Notifications
            .addNotificationReceivedListener(notification => {
                setNotification(notification)
            })

        responseListener.current = Notifications
            .addNotificationResponseReceivedListener(response => {
                console.log(response)
            })

        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current)
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current)
        }
    }, [])

    const scheduleNotification = async (content, date) => {
        if (!date) return

        const parts = getDateTimeParts(date)
        const seconds = getSecondsUntilDate(parts)

        await Notifications.scheduleNotificationAsync({
            content: {
                title: content.title ?? NOTIFICATION_CONTENT.title,
                body: content.note ?? NOTIFICATION_CONTENT.body
            },
            trigger: {
                seconds: getSecondsUntilDate(parts),
                repeats: false
            }
        })
    }

    return { scheduleNotification }
}

const getDateTimeParts = (date) => {
    const parts = date.split(' ')
    const [year, month, day] = parts[0].split('-')
    const [hour, minute] = parts[1].split(':')

    return { year, month, day, hour, minute }
}

const getSecondsUntilDate = ({ month, day, hour, minute }) => {
    const now = new Date()
    let date = new Date(now.getFullYear(), month - 1, day, hour, minute, 0)

    let diff = date.getTime() - now.getTime()

    if (diff > 0) {
        return Math.floor(diff / 1000)
    } else {
        date = new Date(now.getFullYear() + 1, month, day, hour, minute)
        diff = date.getTime() - now.getTime()
        return Math.floor(diff / 1000)
    }
}

async function registerForPushNotificationsAsync() {
    let token

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: COLORS.common.accent
        })
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()

        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!')
            return
        }

        try {
            const projectId = Constants.expoConfig.extra.eas.projectId ?? Constants.easConfig.projectId

            if (!projectId) {
                throw new Error('Project ID not found')
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data

            console.log(token)
        } catch (e) {
            token = e
        }
    } else {
        alert('Must use physical device for Push Notifications')
    }

    return token
}
