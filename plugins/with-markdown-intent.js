const { withAndroidManifest, withInfoPlist, AndroidConfig } = require('expo/config-plugins')

const MARKDOWN_UTI = 'net.daringfireball.markdown'

const withMarkdownIntent = (config) => {
    config = withAndroidManifest(config, (config) => {
        const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults)

        mainActivity['intent-filter'] = mainActivity['intent-filter'] || []

        mainActivity['intent-filter'].push({
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [
                { $: { 'android:name': 'android.intent.category.DEFAULT' } },
                { $: { 'android:name': 'android.intent.category.BROWSABLE' } }
            ],
            data: [
                { $: { 'android:scheme': 'content', 'android:host': '*', 'android:mimeType': 'text/markdown' } },
                { $: { 'android:scheme': 'content', 'android:host': '*', 'android:mimeType': 'text/x-markdown' } },
                { $: { 'android:scheme': 'content', 'android:host': '*', 'android:mimeType': '*/*', 'android:pathPattern': '.*\\\\.md' } },
                { $: { 'android:scheme': 'file', 'android:host': '*', 'android:mimeType': '*/*', 'android:pathPattern': '.*\\\\.md' } }
            ]
        })

        // "Open with" matches by mimeType only, no scheme allowed here
        mainActivity['intent-filter'].push({
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [
                { $: { 'android:name': 'android.intent.category.DEFAULT' } }
            ],
            data: [
                { $: { 'android:mimeType': 'text/markdown' } },
                { $: { 'android:mimeType': 'text/x-markdown' } }
            ]
        })

        return config
    })

    config = withInfoPlist(config, (config) => {
        config.modResults.CFBundleDocumentTypes = [
            ...(config.modResults.CFBundleDocumentTypes || []),
            {
                CFBundleTypeName: 'Markdown Document',
                CFBundleTypeRole: 'Editor',
                LSHandlerRank: 'Alternate',
                LSItemContentTypes: [MARKDOWN_UTI]
            }
        ]

        config.modResults.UTImportedTypeDeclarations = [
            ...(config.modResults.UTImportedTypeDeclarations || []),
            {
                UTTypeIdentifier: MARKDOWN_UTI,
                UTTypeDescription: 'Markdown Document',
                UTTypeConformsTo: ['public.plain-text'],
                UTTypeTagSpecification: {
                    'public.filename-extension': ['md', 'markdown']
                }
            }
        ]

        return config
    })

    return config
}

module.exports = withMarkdownIntent
