import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { getTheme } from '../utils'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useTheme() {
    const { color, setColor } = useContext(ThemeContext)
    const [theme, setTheme] = useState({})

    useEffect(() => {
        const theme = getTheme(color)
        setTheme(theme)
        saveThemeToStorage(color)
    }, [color])

    useEffect(() => {
        initTheme()
    }, [])

    const changeTheme = (color) => {
        setColor(color)
    }

    const initTheme = () => {
        AsyncStorage.getItem('userTheme')
            .then((theme) => {
                console.log(theme)
                if (theme) {
                    setColor(theme)
                } else {
                    setColor('Orange')
                }
            })
    }

    const saveThemeToStorage = (color) => {
        AsyncStorage.setItem('userTheme', color)
    }

    return {
        color,
        theme,
        changeTheme,
        initTheme
    }
}
