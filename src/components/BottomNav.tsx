'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, PlusCircle } from 'lucide-react'

export default function BottomNav() {
  const path = usePathname()

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        <Link href="/"
          className={`flex flex-col items-center gap-1 px-6 py-2 ${isActive('/') ? 'text-indigo-600' : 'text-gray-500'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link href="/contacts/new"
          className="flex flex-col items-center gap-1 px-6 py-2 text-indigo-600">
          <PlusCircle size={22} strokeWidth={1.8} />
          <span className="text-xs font-medium">Add</span>
        </Link>

        <Link href="/contacts"
          className={`flex flex-col items-center gap-1 px-6 py-2 ${isActive('/contacts') && path !== '/contacts/new' ? 'text-indigo-600' : 'text-gray-500'}`}>
          <Users size={22} strokeWidth={isActive('/contacts') && path !== '/contacts/new' ? 2.5 : 1.8} />
          <span className="text-xs font-medium">Contacts</span>
        </Link>
      </div>
    </nav>
  )
}
