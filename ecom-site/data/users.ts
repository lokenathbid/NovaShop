import type { User } from '@/types';

export const mockUser: User = {
  id: 'user-001',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  phone: '+91 98765 43210',
  avatar: undefined,
  createdAt: '2025-03-15T00:00:00Z',
  addresses: [
    {
      id: 'addr-001',
      label: 'Home',
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      addressLine1: 'Flat 4B, Skyline Residency',
      addressLine2: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400058',
      country: 'India',
      isDefault: true,
    },
    {
      id: 'addr-002',
      label: 'Office',
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      addressLine1: '7th Floor, Tech Park One',
      addressLine2: 'Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560066',
      country: 'India',
      isDefault: false,
    },
  ],
};
