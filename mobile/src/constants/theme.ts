export const Colors = {
  // Brand
  primary: '#1B5E20',       // Deep green
  primaryLight: '#2E7D32',
  primaryDark: '#145A18',
  secondary: '#F9A825',     // Gold
  secondaryLight: '#FFCA28',
  secondaryDark: '#F57F17',

  // Neutrals
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',
  border: '#E0E0E0',
  divider: '#F0F0F0',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#1A1A1A',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Order status colors
  statusReceived: '#6B7280',
  statusPreparing: '#F59E0B',
  statusReady: '#3B82F6',
  statusPickedUp: '#8B5CF6',
  statusDelivered: '#22C55E',
  statusCancelled: '#EF4444',

  // Map
  mapDriver: '#1B5E20',
  mapRestaurant: '#F9A825',
  mapCustomer: '#EF4444',

  // Misc
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
  },
};
