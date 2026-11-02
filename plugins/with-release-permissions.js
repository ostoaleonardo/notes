const { withAndroidManifest } = require('expo/config-plugins')

const BLOCKED_PERMISSIONS = ['android.permission.SYSTEM_ALERT_WINDOW']

const withReleasePermissions = (config) => withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    manifest['uses-permission'] = (manifest['uses-permission'] || []).filter(
        (permission) => !BLOCKED_PERMISSIONS.includes(permission.$['android:name'])
    )

    return config
})

module.exports = withReleasePermissions
