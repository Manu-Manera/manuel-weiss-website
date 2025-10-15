// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Manuel Weiss Platform',
  tagline: 'Enterprise HR & Digitalisierung Platform',
  favicon: 'img/favicon.ico',

  url: 'https://docs.manuel-weiss.com',
  baseUrl: '/',

  organizationName: 'manuel-weiss',
  projectName: 'platform-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/manuel-weiss/platform/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/manuel-weiss/platform/tree/main/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Manuel Weiss Platform',
        logo: {
          alt: 'Manuel Weiss Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Dokumentation',
          },
          {
            to: '/api',
            label: 'API Docs',
            position: 'left',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left'
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/manuel-weiss/platform',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Dokumentation',
            items: [
              {
                label: 'Erste Schritte',
                to: '/docs/getting-started',
              },
              {
                label: 'API Referenz',
                to: '/api',
              },
              {
                label: 'Tutorials',
                to: '/docs/tutorials',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/manuel-weiss/platform',
              },
              {
                label: 'Support',
                href: 'https://github.com/manuel-weiss/platform/issues',
              },
            ],
          },
          {
            title: 'Mehr',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Changelog',
                to: '/docs/changelog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Manuel Weiss Platform. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'yaml', 'json'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      algolia: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'manuel-weiss-platform',
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
      },
    }),
};

module.exports = config;
