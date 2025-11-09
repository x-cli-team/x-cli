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
import {useDocsSidebar} from '@docusaurus/theme-common/internal';

export default function NavbarMobileSidebar() {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();
  const isDocsPage = location.pathname.startsWith('/docs');
  const sidebar = useDocsSidebar();

  return (
    <NavbarMobileSidebarLayout>
      <NavbarMobileSidebarHeader />
      <NavbarMobileSidebarPrimaryMenu />
      <NavbarMobileSidebarSecondaryMenu />
      {isDocsPage && sidebar && (
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
          {sidebar.items.map((item, index) => (
            <div key={index} style={{padding: '0.25rem 0'}}>
              {item.type === 'category' ? (
                <div>
                  <div style={{
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    color: 'var(--ifm-color-content-secondary)',
                    fontSize: '0.875rem'
                  }}>
                    {item.label}
                  </div>
                  {item.items && item.items.map((subItem, subIndex) => (
                    <a
                      key={subIndex}
                      href={subItem.href || `/docs/${subItem.id}`}
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem 0.5rem 2rem',
                        color: 'var(--ifm-color-content-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                      }}
                      onClick={() => mobileSidebar.toggle()}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  href={item.href || `/docs/${item.id}`}
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    color: 'var(--ifm-color-content-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                  onClick={() => mobileSidebar.toggle()}
                >
                  {item.label}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </NavbarMobileSidebarLayout>
  );
}