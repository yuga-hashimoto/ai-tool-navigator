import React from 'react';

export function AffiliateDisclaimer() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 my-8">
      <div className="flex flex-col space-y-1.5 pb-2">
        <h3 className="text-lg font-semibold leading-none tracking-tight">Affiliate Disclosure</h3>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>
          We may earn a commission when you click on links and make a purchase. This helps support our independent reviews and analysis.
        </p>
      </div>
    </div>
  );
}
