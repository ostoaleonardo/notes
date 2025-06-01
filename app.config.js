export default {
  name: 'Notes',
  slug: 'notes',
  scheme: 'notes',
  version: '1.3.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    splash: {
      image: './assets/light-splash.png',
      resizeMode: 'contain',
      backgroundColor: '#d7d8d8',
      dark: {
        image: './assets/dark-splash.png',
        resizeMode: 'contain',
        backgroundColor: '#06080a'
      }
    },
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    package: 'com.monospace.notes.dev',
    versionCode: 9
  },
  plugins: [
    'expo-router',
    'expo-font',
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
