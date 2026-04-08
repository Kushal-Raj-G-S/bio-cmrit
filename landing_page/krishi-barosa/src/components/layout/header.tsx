'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslate } from '@/hooks/useTranslate';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Wheat, Shield, Users, GraduationCap, BarChart3, Home, User, Settings, LogOut, Bell } from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { NotificationBell } from '@/components/shared/notification-bell';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface HeaderProps {
  currentRole?: 'farmer' | 'manufacturer' | 'consumer' | 'education' | 'admin' | null;
  onRoleChange?: (role: 'farmer' | 'manufacturer' | 'consumer' | 'education' | 'admin' | null) => void;
}

export function Header({ currentRole, onRoleChange }: HeaderProps): React.JSX.Element {
  const { user, signOut } = useAuth();
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSignOut = (): void => {
    signOut();
    onRoleChange?.(null);
  };

  // Check if user is admin (case-insensitive)
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const userRole = user?.role?.toLowerCase();

  // Create role-based navigation - updated to show consumer dashboard to everyone
  const navigationItems = [
    { key: 'home', label: t('nav.home'), icon: Home, role: null },
    // Show user's own role dashboard OR farmer dashboard for admins
    ...(userRole === 'farmer' || isAdmin ? [{ key: 'farmer', label: t('nav.farmerDashboard'), icon: Wheat, role: 'farmer' as const }] : []),
    ...(userRole === 'manufacturer' || isAdmin ? [{ key: 'manufacturer', label: 'Manufacturer Dashboard', icon: Shield, role: 'manufacturer' as const }] : []),
    // Show consumer dashboard to everyone (since everyone is a consumer in the supply chain)
    { key: 'consumer', label: t('nav.productVerification'), icon: Users, role: 'consumer' as const },
    // Always show education center to everyone
    { key: 'education', label: t('nav.education'), icon: GraduationCap, role: 'education' as const },
    // Show admin dashboard only for admin users  
    ...(isAdmin ? [{ key: 'admin', label: 'Admin Dashboard', icon: BarChart3, role: 'admin' as const }] : []),
  ];

  const handleRoleChange = (role: typeof currentRole): void => {
    if (role && onRoleChange) {
      onRoleChange(role);
    }
    setIsOpen(false);
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logo/logo.png" 
              alt="GrainTrust Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12"
              priority
              quality={100}
            />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
                KrishiBarosa
              </h1>
              <p className="text-xs font-medium text-slate-600 tracking-wider uppercase">
                {t('home.hero.title')}
              </p>
            </div>
          </div>

          {/* Current Role Badge */}
          {currentRole && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold tracking-wide px-3 py-1">
                {navigationItems.find(item => item.role === currentRole)?.label}
              </Badge>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  variant={currentRole === item.role ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleRoleChange(item.role)}
                  className={`gap-2 transition-all duration-300 font-bold tracking-wide text-sm ${
                    currentRole === item.role
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg font-black'
                      : 'hover:bg-green-50 hover:text-green-700 hover:shadow-md font-semibold text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-bold tracking-wide uppercase text-xs">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {/* Notification Bell - only show for authenticated users */}
            {user && <NotificationBell userId={user.id} />}
            
            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user.profilePicture || user.avatar} 
                        alt={user.name}
                        className="object-cover object-center"
                      />
                      <AvatarFallback className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>{t('nav.notifications')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Image 
                      src="/images/logo/logo.png" 
                      alt="KrishiBarosa Logo" 
                      width={48} 
                      height={48} 
                      className="w-12 h-12"
                      priority
                      quality={100}
                    />
                    <div>
                      <h2 className="text-xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
                        KrishiBarosa
                      </h2>
                      <p className="text-sm font-medium text-slate-600 tracking-wider uppercase">
                        {t('home.hero.title')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.key}
                          variant={currentRole === item.role ? 'default' : 'ghost'}
                          className={`w-full justify-start gap-3 font-bold tracking-wide ${
                            currentRole === item.role
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg font-black'
                              : 'hover:bg-green-50 hover:text-green-700 hover:shadow-md font-semibold text-slate-700'
                          }`}
                          onClick={() => handleRoleChange(item.role)}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-bold tracking-wide uppercase">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {currentRole && (
                    <div className="pt-4 border-t">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">{t('nav.currentRole')}</p>
                        <p className="text-sm text-green-600">
                          {navigationItems.find(item => item.role === currentRole)?.label}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
