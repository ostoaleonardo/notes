export default {
  name: 'Notes',
  slug: 'notes',
  scheme: 'notes',
  version: '1.2.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#d7d8d8'
  },
  android: {
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#d7d8d8',
      dark: {
        backgroundColor: '#06080a'
      }
    },
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#07080a'
    },
    package: 'com.monospace.notes',
    versionCode: 5
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
