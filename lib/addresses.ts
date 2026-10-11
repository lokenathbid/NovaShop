import { prisma } from '@/lib/prisma';
import type { Address, AddressType } from '@/types';

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  type?: AddressType | string;
  label?: string;
  isDefault?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: AddressInput;
}

/**
 * Validates and normalizes address input data.
 */
export function validateAndNormalizeAddressInput(input: Partial<AddressInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const fullName = (input.fullName || '').trim();
  const phone = (input.phone || '').trim();
  const addressLine1 = (input.addressLine1 || '').trim();
  const addressLine2 = input.addressLine2 ? input.addressLine2.trim() : null;
  const landmark = input.landmark ? input.landmark.trim() : null;
  const city = (input.city || '').trim();
  const state = (input.state || '').trim();
  const zipCode = (input.zipCode || '').trim();
  const country = (input.country || 'India').trim();

  // Address Type / Label
  let type = (input.type || input.label || 'Home').trim();
  const validTypes = ['Home', 'Work', 'Other'];
  if (!validTypes.includes(type)) {
    // If user typed a custom label or different casing, normalize or accept
    const matched = validTypes.find((t) => t.toLowerCase() === type.toLowerCase());
    type = matched || (type.length > 0 ? type.slice(0, 50) : 'Home');
  }
  const label = (input.label || type).trim();

  // Validations
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (fullName.length > 100) {
    errors.fullName = 'Full name cannot exceed 100 characters.';
  }

  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else {
    // Clean phone number from whitespace and hyphens for digit check
    const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.phone = 'Please enter a valid phone number (7-15 digits).';
    }
  }

  if (!addressLine1) {
    errors.addressLine1 = 'Address line 1 is required.';
  } else if (addressLine1.length < 3) {
    errors.addressLine1 = 'Address line 1 must be at least 3 characters.';
  } else if (addressLine1.length > 255) {
    errors.addressLine1 = 'Address line 1 cannot exceed 255 characters.';
  }

  if (addressLine2 && addressLine2.length > 255) {
    errors.addressLine2 = 'Address line 2 cannot exceed 255 characters.';
  }

  if (landmark && landmark.length > 100) {
    errors.landmark = 'Landmark cannot exceed 100 characters.';
  }

  if (!city) {
    errors.city = 'City is required.';
  } else if (city.length < 2) {
    errors.city = 'City must be at least 2 characters.';
  } else if (city.length > 100) {
    errors.city = 'City cannot exceed 100 characters.';
  }

  if (!state) {
    errors.state = 'State is required.';
  } else if (state.length < 2) {
    errors.state = 'State must be at least 2 characters.';
  } else if (state.length > 100) {
    errors.state = 'State cannot exceed 100 characters.';
  }

  if (!zipCode) {
    errors.zipCode = 'Postal / ZIP code is required.';
  } else if (zipCode.length < 3 || zipCode.length > 20) {
    errors.zipCode = 'Please enter a valid postal code (3-20 characters).';
  }

  if (!country) {
    errors.country = 'Country is required.';
  } else if (country.length > 100) {
    errors.country = 'Country cannot exceed 100 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      zipCode,
      country,
      type,
      label,
      isDefault: Boolean(input.isDefault),
    },
  };
}

/**
 * Retrieves all saved addresses for a specific authenticated user,
 * ordered with default address first, then most recently created.
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
  const records = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return records.map(formatAddressRecord);
}

/**
 * Retrieves a single address by ID ensuring it belongs to the given user.
 */
export async function getUserAddressById(userId: string, addressId: string): Promise<Address | null> {
  const record = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!record) return null;
  return formatAddressRecord(record);
}

/**
 * Retrieves the default address for a user.
 * If no address is explicitly marked default, falls back to the most recently created address.
 */
export async function getUserDefaultAddress(userId: string): Promise<Address | null> {
  const record = await prisma.address.findFirst({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  if (!record) return null;
  return formatAddressRecord(record);
}

/**
 * Creates a new address for the user.
 * - If user has 0 addresses, this address is automatically set as default.
 * - If `isDefault` is true, previous default addresses are unset inside a database transaction.
 */
export async function createAddress(userId: string, input: AddressInput): Promise<Address> {
  const totalCount = await prisma.address.count({
    where: { userId },
  });

  // If first address, always make it default
  const shouldBeDefault = totalCount === 0 || input.isDefault === true;

  if (shouldBeDefault) {
    return await prisma.$transaction(async (tx) => {
      // Unset previous defaults
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      const newAddr = await tx.address.create({
        data: {
          userId,
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          landmark: input.landmark ?? null,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country || 'India',
          type: input.type || 'Home',
          label: input.label || input.type || 'Home',
          isDefault: true,
        },
      });

      return formatAddressRecord(newAddr);
    });
  }

  const newAddr = await prisma.address.create({
    data: {
      userId,
      fullName: input.fullName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      landmark: input.landmark ?? null,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      country: input.country || 'India',
      type: input.type || 'Home',
      label: input.label || input.type || 'Home',
      isDefault: false,
    },
  });

  return formatAddressRecord(newAddr);
}

/**
 * Updates an address owned by the user.
 * - Ensures ownership before update.
 * - Handles default address consistency inside a transaction.
 */
export async function updateAddress(
  userId: string,
  addressId: string,
  input: AddressInput
): Promise<Address | null> {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    return null;
  }

  // Check if we are toggling isDefault
  const willBeDefault = Boolean(input.isDefault);

  if (willBeDefault) {
    return await prisma.$transaction(async (tx) => {
      // Unset all other addresses as default
      await tx.address.updateMany({
        where: { userId, id: { not: addressId }, isDefault: true },
        data: { isDefault: false },
      });

      const updated = await tx.address.update({
        where: { id: addressId },
        data: {
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          landmark: input.landmark ?? null,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country || 'India',
          type: input.type || 'Home',
          label: input.label || input.type || 'Home',
          isDefault: true,
        },
      });

      return formatAddressRecord(updated);
    });
  }

  // If user is explicitly setting isDefault to false on an existing default address:
  // If user has other addresses, promote the newest remaining address to default to avoid orphan non-default state.
  if (existing.isDefault && !willBeDefault) {
    return await prisma.$transaction(async (tx) => {
      const otherAddr = await tx.address.findFirst({
        where: { userId, id: { not: addressId } },
        orderBy: { createdAt: 'desc' },
      });

      if (otherAddr) {
        await tx.address.update({
          where: { id: otherAddr.id },
          data: { isDefault: true },
        });
      }

      const updated = await tx.address.update({
        where: { id: addressId },
        data: {
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          landmark: input.landmark ?? null,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country || 'India',
          type: input.type || 'Home',
          label: input.label || input.type || 'Home',
          isDefault: otherAddr ? false : true, // If it's the only address, keep it default
        },
      });

      return formatAddressRecord(updated);
    });
  }

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: {
      fullName: input.fullName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      landmark: input.landmark ?? null,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      country: input.country || 'India',
      type: input.type || 'Home',
      label: input.label || input.type || 'Home',
      isDefault: existing.isDefault,
    },
  });

  return formatAddressRecord(updated);
}

/**
 * Sets an address as the default address for the user.
 * Unsets any other default address within a transaction.
 */
export async function setDefaultAddress(userId: string, addressId: string): Promise<Address | null> {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    return null;
  }

  return await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const updated = await tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return formatAddressRecord(updated);
  });
}

/**
 * Deletes an address owned by the user.
 * Policy for deleting a default address:
 * If the deleted address was the default address and other addresses remain,
 * the most recently created remaining address is automatically promoted to default.
 */
export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<{ success: boolean; newDefaultId?: string | null }> {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    return { success: false };
  }

  return await prisma.$transaction(async (tx) => {
    await tx.address.delete({
      where: { id: addressId },
    });

    let newDefaultId: string | null = null;

    if (existing.isDefault) {
      // Find remaining addresses
      const nextDefault = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextDefault) {
        await tx.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
        newDefaultId = nextDefault.id;
      }
    }

    return { success: true, newDefaultId };
  });
}

function formatAddressRecord(record: {
  id: string;
  userId: string;
  type: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Address {
  return {
    id: record.id,
    userId: record.userId,
    type: record.type,
    label: record.label,
    fullName: record.fullName,
    phone: record.phone,
    addressLine1: record.addressLine1,
    addressLine2: record.addressLine2 ?? undefined,
    landmark: record.landmark ?? undefined,
    city: record.city,
    state: record.state,
    zipCode: record.zipCode,
    country: record.country,
    isDefault: record.isDefault,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
