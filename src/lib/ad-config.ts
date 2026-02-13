
export const AD_CONFIG = {
  adsense: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
    slots: {
      grid: 'grid-slot-id-placeholder',
      content: 'content-slot-id-placeholder',
      sidebar: 'sidebar-slot-id-placeholder',
    },
  },
  gam: {
    networkId: '123456789', // Example Network ID
    slots: {
      grid: '/123456789/grid_ad_unit',
      content: '/123456789/content_ad_unit',
      sidebar: '/123456789/sidebar_ad_unit',
    },
    sizes: {
      grid: [[300, 250], [336, 280]] as [number, number][],
      content: [[728, 90], [300, 250], [320, 100]] as [number, number][],
      sidebar: [[300, 250], [300, 600]] as [number, number][],
    },
  },
};

export type AdNetwork = 'adsense' | 'gam';
