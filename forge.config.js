module.exports = {
  packagerConfig: {
    icon: 'favicon.ico',
    protocols: [
      {
        name: 'Directus app',
        protocol: 'directus',
        schemes: ['directus'],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        mimeType: ['x-scheme-handler/directus'],
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
