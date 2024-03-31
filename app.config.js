const DEV = process.env.VARIANT === 'development'

const NAME = DEV ? 'Notes (Dev)' : 'Notes'
const PACKAGE = DEV ? 'com.monospace.notes.dev' : 'com.monospace.notes'

const widgetConfig = {
  fonts: ['./assets/fonts/RobotoMono.ttf'],
  widgets: [
    {
      name: 'Note',
      label: 'A note',
      minWidth: '320dp',
      minHeight: '60dp',
      resizeMode: 'horizontal|vertical',
      description: 'Preview a note',
      previewImage: './assets/widgets/note.png',
      updatePeriodMillis: 1800000,
    },
  ],
};

export default {
  name: NAME,
  slug: 'notes',
  scheme: 'notes',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#09090b',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#09090b'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#09090b'
    },
    package: PACKAGE,
    versionCode: 2
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-localization',
    ['react-native-android-widget', widgetConfig]
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
