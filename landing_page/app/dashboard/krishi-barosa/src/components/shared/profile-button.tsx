'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export function ProfileButton() {
  const { user } = useAuth();
  const router = useRouter();

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleProfileClick}
      className="h-10 w-10 rounded-full p-0"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={user?.profilePicture || user?.avatar} 
          alt={user?.name}
          className="object-cover object-center"
        />
        <AvatarFallback className="bg-gradient-to-r from-green-600 to-green-700 text-white text-sm">
          {getInitials(user?.name || '')}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
}
