import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'X CLI',
  tagline: 'Claude Code-level intelligence in your terminal',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://xclicli.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'x-cli-team', // Usually your GitHub org/user name.
  projectName: 'x-cli', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'X CLI',
      logo: {
        alt: 'X CLI Logo',
        src: 'img/x-cli-logo.svg',
      },
      items: [
        {
          to: '/docs/getting-started/quickstart',
          label: 'For Users',
          position: 'left',
        },
        {
          to: '/docs/community/testimonials',
          label: 'Community',
          position: 'left',
        },
        {
          to: '/docs/architecture/overview',
          label: 'For Developers',
          position: 'left',
        },
        {
          href: 'https://discord.com/channels/1315720379607679066/1315822328139223064',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://github.com/x-cli-team/x-cli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Overview',
              to: '/docs/overview',
            },
            {
              label: 'Installation',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/overview',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.com/channels/1315720379607679066/1315822328139223064',
            },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/x-cli-team/x-cli/issues',
            },
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/@xagent/x-cli',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Documentation',
              to: '/docs/overview',
            },
            {
              label: 'Roadmap',
              to: '/docs/roadmap',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/x-cli-team/x-cli',
            },
          ],
        },
        {
          title: 'Credits',
          items: [
            {
              label: 'Original Grok CLI',
              href: 'https://github.com/superagent-ai/grok-cli',
            },
            {
              label: 'Ismail Pelaseyed',
              href: 'https://github.com/homanp',
            },
            {
              label: 'Superagent.ai',
              href: 'https://github.com/superagent-ai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} X CLI. Built with Docusaurus. Forked from <a href="https://github.com/superagent-ai/grok-cli" target="_blank" rel="noopener noreferrer">Superagent.ai</a> by <a href="https://github.com/homanp" target="_blank" rel="noopener noreferrer">Ismail Pelaseyed</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
