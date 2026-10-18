const {
    withAndroidColors,
    withAndroidColorsNight,
    withAndroidStyles,
    AndroidConfig
} = require('expo/config-plugins')

const HANDLE_COLOR_NAME = 'textHandleColor'
const HANDLE_COLORS = { day: '#06080a', night: '#f0f2f1' }
const THEME_ITEMS = ['colorControlActivated', 'colorAccent']

const withTextHandleColor = (config) => {
    config = withAndroidColors(config, (config) => {
        config.modResults = AndroidConfig.Colors.assignColorValue(config.modResults, {
            name: HANDLE_COLOR_NAME,
            value: HANDLE_COLORS.day
        })

        return config
    })

    config = withAndroidColorsNight(config, (config) => {
        config.modResults = AndroidConfig.Colors.assignColorValue(config.modResults, {
            name: HANDLE_COLOR_NAME,
            value: HANDLE_COLORS.night
        })

        return config
    })

    return withAndroidStyles(config, (config) => {
        THEME_ITEMS.forEach((name) => {
            config.modResults = AndroidConfig.Styles.assignStylesValue(config.modResults, {
                add: true,
                parent: AndroidConfig.Styles.getAppThemeGroup(),
                name,
                value: `@color/${HANDLE_COLOR_NAME}`
            })
        })

        return config
    })
}

module.exports = withTextHandleColor
