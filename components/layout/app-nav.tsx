'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Music, Settings, LogOut, Menu, X, Blocks, Shield, DollarSign, CalendarDays, ShoppingBag, Mail, MessageCircle, Users, MessageSquare, HelpCircle, BarChart3, ScrollText, GraduationCap, FileText, Wrench, CreditCard, Database, Code2, Key } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/today', label: 'Today', icon: CalendarDays },
  { href: '/me/finances', label: 'My Finances', icon: DollarSign },
  { href: '/me/taxes', label: 'Tax Center', icon: FileText },
  { href: '/merch', label: 'Merch', icon: ShoppingBag },
  { href: '/production', label: 'Production', icon: Wrench },
  { href: '/marketing', label: 'Marketing', icon: Mail },
  { href: '/community', label: 'Community', icon: MessageCircle },
  { href: '/hub', label: 'Family Hub', icon: Users },
  { href: '/academy', label: 'Academy', icon: GraduationCap },
  { href: '/help', label: 'Help', icon: HelpCircle },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/developers', label: 'API Docs', icon: Code2 },
  { href: '/data', label: 'Import/Export', icon: Database },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/modules', label: 'Modules', icon: Blocks },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const adminItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/modules', label: 'Modules', icon: Shield },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/api-keys', label: 'API Keys', icon: Key },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
]

interface AppNavProps {
  userName: string
}

export function AppNav({ userName }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg sm:hidden"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen
          ? <X className="h-5 w-5" aria-hidden="true" />
          : <Menu className="h-5 w-5" aria-hidden="true" />
        }
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-default bg-surface
          transition-transform duration-200
          sm:sticky sm:top-0 sm:h-screen sm:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-border-default px-4">
          <Music className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <span className="text-sm font-semibold">Tour Manager OS</span>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Admin section */}
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Admin</p>
            <ul className="flex flex-col gap-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                        focus:outline-none focus:ring-2 focus:ring-primary-500
                        ${isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* User footer */}
        <div className="border-t border-border-default p-3">
          <div className="mb-2 flex items-center gap-2 px-3 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium">{userName}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log Out
          </button>
        </div>
      </nav>
    </>
  )
}
