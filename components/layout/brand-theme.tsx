import {
  brandThemeCss,
  getActiveOrgTheme,
} from '@/lib/white-label/runtime-theme'

/**
 * Injects an inline <style> tag overriding the default --color-primary-*
 * CSS custom properties when the user's org has white-label enabled.
 * Returns null otherwise so the markup stays clean.
 */
export async function BrandTheme({ userId }: { userId: string }) {
  const theme = await getActiveOrgTheme(userId)
  const css = brandThemeCss(theme)
  if (!css) return null
  return (
    <style
      data-brand-theme={theme?.org_id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
