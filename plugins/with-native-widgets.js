const fs = require('fs')
const path = require('path')
const {
    AndroidConfig,
    withAndroidManifest,
    withAppBuildGradle,
    withDangerousMod,
    withProjectBuildGradle
} = require('expo/config-plugins')

const TEMPLATES_DIR = path.join(__dirname, 'native-widgets')
const ICONS_DIR = path.join('src', 'icons', 'xml')
const FONTS_DIR = path.join('assets', 'fonts')
const PREVIEWS_DIR = path.join('assets', 'widget-previews')
const TINT_ATTRIBUTE = /\s*android:tint="[^"]*"/
const PACKAGE_PLACEHOLDER = /__PACKAGE__/g
const COMPOSE_PLUGIN = 'org.jetbrains.kotlin.plugin.compose'
const GLANCE_DEPENDENCY = 'androidx.glance:glance-appwidget:1.2.0'
const BRIDGE_RECEIVER = '.BridgeProvider'

const toSnakeCase = (name) => name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

const buildInfoXml = (widget) => {
    const attributes = {
        minWidth: widget.minWidth,
        minHeight: widget.minHeight,
        targetCellWidth: widget.targetCellWidth,
        targetCellHeight: widget.targetCellHeight,
        minResizeWidth: widget.minResizeWidth,
        minResizeHeight: widget.minResizeHeight,
        maxResizeWidth: widget.maxResizeWidth,
        maxResizeHeight: widget.maxResizeHeight,
        resizeMode: widget.resizeMode,
        updatePeriodMillis: widget.updatePeriodMillis,
        initialLayout: '@layout/glance_default_loading_layout',
        previewImage: widget.previewImage,
        description: `@string/widget_${toSnakeCase(widget.name)}_description`,
        widgetCategory: 'home_screen'
    }
    const lines = Object.entries(attributes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `    android:${key}="${value}"`)
        .join('\n')

    return `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
${lines} />
`
}

const escapeAndroidString = (value) => value.replace(/'/g, "\\'")

const buildStringsXml = (widgets, strings) => `<?xml version="1.0" encoding="utf-8"?>
<resources>
${widgets.map((widget) => (
    `    <string name="widget_${toSnakeCase(widget.name)}_description">${escapeAndroidString(widget.description)}</string>`
)).concat(Object.entries(strings).map(([name, value]) => (
    `    <string name="${name}">${escapeAndroidString(value)}</string>`
))).join('\n')}
</resources>
`

const copyPreview = (projectRoot, main, snake) => {
    const day = path.join(projectRoot, PREVIEWS_DIR, `${snake}.png`)
    const night = path.join(projectRoot, PREVIEWS_DIR, `${snake}_night.png`)

    if (!fs.existsSync(day)) return undefined

    const drawable = `widget_preview_${snake}`

    fs.copyFileSync(day, path.join(main, 'res/drawable-nodpi', `${drawable}.png`))
    if (fs.existsSync(night)) {
        fs.copyFileSync(night, path.join(main, 'res/drawable-night-nodpi', `${drawable}.png`))
    }

    return `@drawable/${drawable}`
}

const withNativeWidgetFiles = (config, { widgets, icons, fonts, strings }) => withDangerousMod(config, [
    'android',
    (config) => {
        const androidPackage = AndroidConfig.Package.getPackage(config)
        const { projectRoot, platformProjectRoot } = config.modRequest
        const main = path.join(platformProjectRoot, 'app/src/main')
        const sourceDirectory = path.join(main, 'java', ...androidPackage.split('.'))

        ;['xml', 'values', 'drawable', 'drawable-nodpi', 'drawable-night-nodpi', 'font'].forEach((directory) => {
            fs.mkdirSync(path.join(main, 'res', directory), { recursive: true })
        })
        fs.mkdirSync(sourceDirectory, { recursive: true })

        fs.readdirSync(TEMPLATES_DIR).forEach((file) => {
            const source = fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8')
            fs.writeFileSync(
                path.join(sourceDirectory, file),
                source.replace(PACKAGE_PLACEHOLDER, androidPackage)
            )
        })

        widgets.forEach((widget) => {
            const snake = toSnakeCase(widget.name)
            const preview = copyPreview(projectRoot, main, snake)

            fs.writeFileSync(
                path.join(main, 'res/xml', `${snake}_widget_info.xml`),
                buildInfoXml({ ...widget, previewImage: preview })
            )
        })
        fs.writeFileSync(
            path.join(main, 'res/values/native_widgets.xml'),
            buildStringsXml(widgets, strings)
        )

        Object.entries(icons).forEach(([drawable, source]) => {
            const xml = fs.readFileSync(path.join(projectRoot, ICONS_DIR, `${source}.xml`), 'utf8')
            fs.writeFileSync(path.join(main, 'res/drawable', `${drawable}.xml`), xml.replace(TINT_ATTRIBUTE, ''))
        })

        Object.entries(fonts).forEach(([resource, source]) => {
            fs.copyFileSync(
                path.join(projectRoot, FONTS_DIR, source),
                path.join(main, 'res/font', `${resource}.ttf`)
            )
        })

        return config
    }
])

const withNativeWidgetManifest = (config, { widgets }) => withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0]

    application.receiver = (application.receiver || []).filter(
        (receiver) => !widgets.some((widget) => receiver.$['android:name'] === `.${widget.name}WidgetReceiver`)
    )
    application.receiver.forEach((receiver) => {
        if (receiver.$['android:name'] === BRIDGE_RECEIVER) receiver.$['android:enabled'] = 'false'
    })

    widgets.forEach((widget) => {
        application.receiver.push({
            $: {
                'android:name': `.${widget.name}WidgetReceiver`,
                'android:exported': 'true',
                'android:label': widget.label
            },
            'intent-filter': [{
                action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }]
            }],
            'meta-data': [{
                $: {
                    'android:name': 'android.appwidget.provider',
                    'android:resource': `@xml/${toSnakeCase(widget.name)}_widget_info`
                }
            }]
        })
    })

    application.provider = (application.provider || []).filter(
        (provider) => provider.$['android:name'] !== '.WidgetsSyncProvider'
    )
    application.provider.push({
        $: {
            'android:name': '.WidgetsSyncProvider',
            'android:authorities': '${applicationId}.widgets-sync',
            'android:exported': 'false'
        }
    })

    return config
})

const withComposeGradle = (config) => {
    config = withProjectBuildGradle(config, (config) => {
        const classpath = `classpath("${COMPOSE_PLUGIN}:${COMPOSE_PLUGIN}.gradle.plugin:$kotlinVersion")`

        if (!config.modResults.contents.includes(COMPOSE_PLUGIN)) {
            config.modResults.contents = config.modResults.contents.replace(
                /(classpath\(kotlinVersion[^\n]*\n)/,
                `$1    ${classpath}\n`
            )
        }

        return config
    })

    return withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents

        if (!contents.includes(COMPOSE_PLUGIN)) {
            contents = contents.replace(
                /apply plugin: "com.android.application"\n/,
                `apply plugin: "com.android.application"\napply plugin: "${COMPOSE_PLUGIN}"\n`
            )
            contents = contents.replace(/android \{\n/, 'android {\n    buildFeatures {\n        compose true\n    }\n')
            contents = contents.replace(
                /dependencies \{\n/,
                `dependencies {\n    implementation "${GLANCE_DEPENDENCY}"\n`
            )
        }

        config.modResults.contents = contents

        return config
    })
}

const withNativeWidgets = (config, options) => {
    config = withNativeWidgetFiles(config, options)
    config = withNativeWidgetManifest(config, options)

    return withComposeGradle(config)
}

module.exports = withNativeWidgets
