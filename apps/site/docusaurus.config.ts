import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Grok CLI',
  tagline: 'Claude Code-level intelligence in your terminal',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://grokcli.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'hinetapora', // Usually your GitHub org/user name.
  projectName: 'grok-cli-hurry-mode', // Usually your repo name.

  onBrokenLinks: 'throw',

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
      title: 'Grok CLI',
      logo: {
        alt: 'Grok CLI Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://discord.com/channels/1315720379607679066/1315822328139223064',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://github.com/hinetapora/grok-cli-hurry-mode',
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
              label: 'Tutorial',
              to: '/docs/intro',
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
              href: 'https://github.com/hinetapora/grok-cli-hurry-mode/issues',
            },
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/grok-cli-hurry-mode',
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
              href: 'https://github.com/hinetapora/grok-cli-hurry-mode',
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
      copyright: `Copyright © ${new Date().getFullYear()} Grok CLI. Built with Docusaurus. Original project by <a href="https://github.com/homanp" target="_blank" rel="noopener noreferrer">Ismail Pelaseyed</a> at <a href="https://github.com/superagent-ai/grok-cli" target="_blank" rel="noopener noreferrer">Superagent.ai</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
