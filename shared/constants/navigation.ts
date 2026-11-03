/**
 * The four application areas. The shared header links to all of them from
 * every area, so a user can move between the public site, the kiosk, and the
 * operational panels without editing the URL. Defined once so the header
 * never duplicates link lists per page.
 */
export type AppArea = 'public' | 'kiosk' | 'staff' | 'admin'

export interface NavigationItem {
  /** Route path — also the stable key. */
  path: string
  /** Translation key; link copy is never hardcoded in a component. */
  labelKey: string
}

export const SITE_NAVIGATION: readonly NavigationItem[] = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/kiosk', labelKey: 'nav.kiosk' },
  { path: '/staff', labelKey: 'nav.staff' },
  { path: '/admin', labelKey: 'nav.admin' }
]

export function resolveAppArea(path: string): AppArea {
  if (path === '/staff' || path.startsWith('/staff/')) {
    return 'staff'
  }
  if (path === '/admin' || path.startsWith('/admin/')) {
    return 'admin'
  }
  if (path === '/kiosk' || path.startsWith('/kiosk/')) {
    return 'kiosk'
  }
  return 'public'
}
