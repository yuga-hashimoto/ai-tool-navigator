'use client';

import { useEffect, useState } from 'react';

let geoCache: GeoLocation | null = null;
let geoCacheTime: number = 0;
const GEO_CACHE_DURATION = 60 * 60 * 1000;

export interface GeoLocation {
  countryCode: string;
  countryName: string;
  region?: string;
  city?: string;
  timezone?: string;
  currency?: string;
  isEU?: boolean;
}

export const DEFAULT_GEO_LOCATION: GeoLocation = {
  countryCode: 'XX',
  countryName: 'Unknown',
  isEU: false,
};

export async function getGeoLocation(): Promise<GeoLocation> {
  if (geoCache && Date.now() - geoCacheTime < GEO_CACHE_DURATION) {
    return geoCache;
  }

  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'Accept-Language': 'en' },
    });

    if (response.ok) {
      const data = await response.json();
      const location: GeoLocation = {
        countryCode: data.country_code || 'XX',
        countryName: data.country_name || 'Unknown',
        region: data.region || undefined,
        city: data.city || undefined,
        timezone: data.timezone || undefined,
        currency: data.currency || undefined,
        isEU: data.in_eu || false,
      };

      geoCache = location;
      geoCacheTime = Date.now();

      return location;
    }
  } catch (error) {
    console.debug('Geo location fetch failed:', error);
  }

  return DEFAULT_GEO_LOCATION;
}

export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍';
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

export function getTimeBasedGreeting(geoLocation: GeoLocation): string {
  if (!geoLocation.timezone) {
    return 'Welcome';
  }

  try {
    const now = new Date();
    const timeInZone = new Date(
      now.toLocaleString('en-US', { timeZone: geoLocation.timezone })
    );
    const hour = timeInZone.getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  } catch {
    return 'Welcome';
  }
}

export interface RegionalPricing {
  currency: string;
  symbol: string;
  conversionRate: number;
  localizedPrice?: string;
}

export function getRegionalPricing(
  basePriceUSD: number,
  geoLocation: GeoLocation
): RegionalPricing {
  const pricingByRegion: Record<string, { currency: string; symbol: string; rate: number }> = {
    US: { currency: 'USD', symbol: '$', rate: 1.0 },
    EU: { currency: 'EUR', symbol: '€', rate: 0.92 },
    UK: { currency: 'GBP', symbol: '£', rate: 0.79 },
    JP: { currency: 'JPY', symbol: '¥', rate: 149.5 },
    AU: { currency: 'AUD', symbol: 'A$', rate: 1.53 },
    CA: { currency: 'CAD', symbol: 'C$', rate: 1.36 },
    IN: { currency: 'INR', symbol: '₹', rate: 83.12 },
    BR: { currency: 'BRL', symbol: 'R$', rate: 4.97 },
    DEFAULT: { currency: 'USD', symbol: '$', rate: 1.0 },
  };

  const region = geoLocation.countryCode;
  const pricing = pricingByRegion[region] || pricingByRegion.DEFAULT;

  return {
    currency: pricing.currency,
    symbol: pricing.symbol,
    conversionRate: pricing.rate,
    localizedPrice: `${pricing.symbol}${Math.round(basePriceUSD * pricing.rate)}`,
  };
}

export function clearGeoCache(): void {
  geoCache = null;
  geoCacheTime = 0;
}

export function useGeoLocation(): GeoLocation | null {
  const [location, setLocation] = useState<GeoLocation | null>(null);

  useEffect(() => {
    getGeoLocation().then(setLocation).catch(() => {
      setLocation(DEFAULT_GEO_LOCATION);
    });
  }, []);

  return location;
}
