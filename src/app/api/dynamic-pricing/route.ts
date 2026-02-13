import { NextRequest, NextResponse } from 'next/server';
import { 
  getActiveTimeSensitiveTiers, 
  getBundleSavings, 
  getPopularBundles,
  getBestValueBundles,
  getActiveUrgencySignals,
  calculateUrgencyConversionMetrics,
  trackConversionFunnel,
  recordPriceChange,
  generatePricingRecommendation
} from '@/lib/dynamic-pricing/dynamicPricing';

// GET - Retrieve dynamic pricing data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | null;

    switch (type) {
      case 'tiers': {
        const tiers = id 
          ? [getActiveTimeSensitiveTiers().find(t => t.id === id)].filter(Boolean)
          : getActiveTimeSensitiveTiers();
        return NextResponse.json({ success: true, data: tiers });
      }

      case 'bundles': {
        const bundles = id 
          ? getBundleSavings(id)
          : { popular: getPopularBundles(), all: getBestValueBundles() };
        return NextResponse.json({ success: true, data: bundles });
      }

      case 'signals':
        return NextResponse.json({ success: true, data: getActiveUrgencySignals() });

      case 'metrics': {
        const tierId = searchParams.get('tierId') || 'early_bird_pro';
        const metrics = calculateUrgencyConversionMetrics(tierId, period || 'week');
        return NextResponse.json({ success: true, data: metrics });
      }

      case 'recommendation': {
        const tierId = searchParams.get('tierId') || 'early_bird_pro';
        const conversionRate = parseFloat(searchParams.get('conversionRate') || '0.05');
        const recommendation = generatePricingRecommendation(tierId, conversionRate);
        return NextResponse.json({ success: true, data: recommendation });
      }

      default:
        // Return all dynamic pricing data
        return NextResponse.json({
          success: true,
          data: {
            activeTiers: getActiveTimeSensitiveTiers(),
            popularBundles: getPopularBundles(),
            urgencySignals: getActiveUrgencySignals()
          }
        });
    }
  } catch (error) {
    console.error('Error fetching dynamic pricing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dynamic pricing data' },
      { status: 500 }
    );
  }
}

// POST - Record conversion events and price changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tierId, event, revenue } = body;

    switch (action) {
      case 'track_conversion': {
        if (!tierId || !event) {
          return NextResponse.json(
            { success: false, error: 'Missing tierId or event' },
            { status: 400 }
          );
        }
        trackConversionFunnel(tierId, event, revenue);
        return NextResponse.json({ success: true, message: 'Conversion tracked' });
      }

      case 'record_price_change': {
        const { previousPrice, newPrice, reason, conversionRate } = body;
        if (!tierId || previousPrice === undefined || newPrice === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          );
        }
        const record = recordPriceChange(
          tierId,
          previousPrice,
          newPrice,
          reason || 'manual',
          conversionRate || 0,
          revenue || 0
        );
        return NextResponse.json({ success: true, data: record });
      }

      case 'simulate_purchase': {
        // Simulate a purchase for testing
        const tier = getActiveTimeSensitiveTiers().find(t => t.id === tierId);
        if (tier) {
          tier.currentPurchases += 1;
        }
        return NextResponse.json({ 
          success: true, 
          message: 'Purchase simulated',
          data: { currentPurchases: tier?.currentPurchases }
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing dynamic pricing action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
