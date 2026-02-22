export default {
  name: 'Notes',
  slug: 'notes',
  scheme: 'notes',
  version: '1.4.2',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    package: 'com.monospace.notes',
    versionCode: 12
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/adaptive-icon.png',
        backgroundColor: '#d7d8d8',
        resizeMode: 'contain',
        imageWidth: 270,
        dark: {
          image: './assets/dark-splash.png',
          resizeMode: 'contain',
          backgroundColor: '#06080a'
        }
      }
    ],
    [
      'expo-font',
      {
        'fonts': [
          './assets/fonts/AzeretMono-Light.ttf',
          './assets/fonts/AzeretMono-Medium.ttf',
          './assets/fonts/AzeretMono-Italic.ttf',
          './assets/fonts/NType82-Headline.ttf'
        ]
      }
    ],
    'expo-localization',
    'expo-local-authentication',
    [
      'expo-build-properties', {
        android: {
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true
        }
      }
    ]
  ],
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: '319d937a-0136-4d14-b677-d958cc1b7996'
    }
  }
}
