export const AD_CONFIG = {
  adsense: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
    slots: {
      grid: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GRID,
      content: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_CONTENT,
      sidebar: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR,
    },
  },
  gam: {
    networkId: process.env.NEXT_PUBLIC_GOOGLE_GAM_NETWORK_ID || '',
    slots: {
      grid: process.env.NEXT_PUBLIC_GOOGLE_GAM_SLOT_GRID || '',
      content: process.env.NEXT_PUBLIC_GOOGLE_GAM_SLOT_CONTENT || '',
      sidebar: process.env.NEXT_PUBLIC_GOOGLE_GAM_SLOT_SIDEBAR || '',
    },
    sizes: {
      grid: [[300, 250], [336, 280]] as [number, number][],
      content: [[728, 90], [300, 250], [320, 100]] as [number, number][],
      sidebar: [[300, 250], [300, 600]] as [number, number][],
    },
  },
};

export type AdNetwork = 'adsense' | 'gam';
