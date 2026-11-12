const SMALL_WIDGET_SIZE = {
  minWidth: '40dp',
  minHeight: '40dp',
  targetCellWidth: 2,
  targetCellHeight: 1,
  minResizeWidth: '40dp',
  minResizeHeight: '40dp',
  maxResizeWidth: '180dp',
  maxResizeHeight: '190dp',
  resizeMode: 'horizontal|vertical'
}

export default {
  name: 'Notes',
  slug: 'notes',
  scheme: 'notes',
  version: '1.5.3',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.monospace.notes',
    versionCode: 16,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON
  },
  plugins: [
    'expo-router',
    'expo-asset',
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
          './assets/fonts/NType82-Headline.ttf',
          './assets/fonts/Geist-Regular.ttf'
        ]
      }
    ],
    'expo-image',
    'expo-sharing',
    'expo-status-bar',
    'expo-localization',
    ['expo-image-picker', { microphonePermission: false }],
    './plugins/with-markdown-intent',
    [
      'expo-share-intent',
      {
        disableIOS: true,
        androidIntentFilters: ['text/*']
      }
    ],
    './plugins/with-text-handle-color',
    './plugins/with-release-permissions',
    './plugins/with-transparent-navigation-bar',
    [
      './plugins/with-native-widgets',
      {
        widgets: [
          {
            name: 'NewNote',
            label: 'New note',
            description: 'Create a note from the home screen',
            ...SMALL_WIDGET_SIZE
          },
          {
            name: 'DailyNote',
            label: 'Daily note',
            description: "Open today's note",
            ...SMALL_WIDGET_SIZE,
            updatePeriodMillis: 1800000
          },
          {
            name: 'PinnedNote',
            label: 'Pinned note',
            description: 'Your latest pinned note',
            minWidth: '110dp',
            minHeight: '110dp',
            targetCellWidth: 2,
            targetCellHeight: 2,
            minResizeWidth: '40dp',
            minResizeHeight: '40dp',
            resizeMode: 'horizontal|vertical'
          },
          {
            name: 'QuickBar',
            label: 'Quick actions',
            description: 'New note, daily note, home and pinned note',
            minWidth: '250dp',
            minHeight: '40dp',
            targetCellWidth: 4,
            targetCellHeight: 1,
            minResizeWidth: '110dp',
            minResizeHeight: '40dp',
            maxResizeWidth: '420dp',
            maxResizeHeight: '40dp',
            resizeMode: 'horizontal'
          }
        ],
        icons: {
          widget_add: 'add_sharp_wght100',
          widget_calendar_today: 'calendar_today_sharp_wght100',
          widget_note_stack: 'note_stack_sharp_wght100',
          widget_keep: 'keep_sharp_fill_wght100'
        },
        strings: {
          widget_preview_note_title: 'Project ideas',
          widget_preview_note_extract: 'Review the proposal and schedule the Thursday meeting with the team.'
        },
        fonts: {
          geist_regular: 'Geist-Regular.ttf',
          azeret_mono_light: 'AzeretMono-Light.ttf',
          n_type82_headline: 'NType82-Headline.ttf'
        }
      }
    ],
    [
      'expo-widgets',
      {
        enableAndroid: true,
        widgets: [
          { name: 'Bridge', displayName: 'Bridge', description: 'Data bridge', ios: null, android: {} }
        ]
      }
    ],
    [
      'expo-build-properties', {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          kotlinVersion: '2.2.0'
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
