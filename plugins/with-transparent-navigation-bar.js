const { withAndroidStyles, AndroidConfig } = require('expo/config-plugins')

const ITEM_NAME = 'android:enforceNavigationBarContrast'

const withTransparentNavigationBar = (config) => withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(config.modResults, {
        add: true,
        parent: AndroidConfig.Styles.getAppThemeGroup(),
        name: ITEM_NAME,
        value: 'false'
    })

    return config
})

module.exports = withTransparentNavigationBar
