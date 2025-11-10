import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarMobileSidebarLayout from '@theme/Navbar/MobileSidebar/Layout';
import NavbarMobileSidebarHeader from '@theme/Navbar/MobileSidebar/Header';
import NavbarMobileSidebarPrimaryMenu from '@theme/Navbar/MobileSidebar/PrimaryMenu';
import NavbarMobileSidebarSecondaryMenu from '@theme/Navbar/MobileSidebar/SecondaryMenu';
import {useLocation} from '@docusaurus/router';

export default function NavbarMobileSidebar() {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();
  const isDocsPage = location.pathname.startsWith('/docs');

  return (
    <NavbarMobileSidebarLayout>
      <NavbarMobileSidebarHeader />
      <NavbarMobileSidebarPrimaryMenu />
      <NavbarMobileSidebarSecondaryMenu />
      {isDocsPage && (
        <div style={{
          borderTop: '1px solid var(--ifm-border-color)',
          marginTop: '1rem',
          paddingTop: '1rem'
        }}>
          <div style={{
            fontWeight: '600',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            color: 'var(--ifm-color-content)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Documentation
          </div>
          {/* Static docs menu items */}
          <a href="/docs/getting-started/overview" style={{display: 'block', padding: '0.5rem 1rem', color: 'var(--ifm-color-content-secondary)', textDecoration: 'none', fontSize: '0.875rem'}} onClick={() => mobileSidebar.toggle()}>Getting Started</a>
          <a href="/docs/configuration/settings" style={{display: 'block', padding: '0.5rem 1rem', color: 'var(--ifm-color-content-secondary)', textDecoration: 'none', fontSize: '0.875rem'}} onClick={() => mobileSidebar.toggle()}>Configuration</a>
          <a href="/docs/features/plan-mode" style={{display: 'block', padding: '0.5rem 1rem', color: 'var(--ifm-color-content-secondary)', textDecoration: 'none', fontSize: '0.875rem'}} onClick={() => mobileSidebar.toggle()}>Features</a>
          <a href="/docs/reference/cli-reference" style={{display: 'block', padding: '0.5rem 1rem', color: 'var(--ifm-color-content-secondary)', textDecoration: 'none', fontSize: '0.875rem'}} onClick={() => mobileSidebar.toggle()}>Reference</a>
          <a href="/docs/build-with-claude-code/mcp" style={{display: 'block', padding: '0.5rem 1rem', color: 'var(--ifm-color-content-secondary)', textDecoration: 'none', fontSize: '0.875rem'}} onClick={() => mobileSidebar.toggle()}>Build with Grok</a>
        </div>
      )}
    </NavbarMobileSidebarLayout>
  );
}