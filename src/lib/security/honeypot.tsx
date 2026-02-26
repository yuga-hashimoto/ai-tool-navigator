import React from 'react';

interface HoneypotFieldProps {
  name: string;
  label?: string;
  autoComplete?: string;
}

// CSS styles for honeypot fields
const honeypotStyles: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  opacity: 0,
  pointerEvents: 'none',
  height: 1,
  width: 1,
  margin: 0,
  padding: 0,
  overflow: 'hidden',
};

// Honeypot field component - hidden from humans, visible to bots
export const HoneypotField: React.FC<HoneypotFieldProps> = ({
  name,
  label = 'Leave this empty',
  autoComplete = 'off',
}) => {
  return (
    <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
      <label htmlFor={name} style={{ position: 'absolute', left: '-9999px' }}>
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        autoComplete={autoComplete}
        tabIndex={-1}
        style={honeypotStyles}
        // These attributes help confuse bots
        data-security="honeypot"
      />
    </div>
  );
};

// Time-based honeypot - creates a field that must be filled within a certain time
interface TimeHoneypotProps {
  name: string;
  minTime?: number; // Minimum milliseconds to fill
}

export const TimeHoneypot: React.FC<TimeHoneypotProps> = ({ 
  name,
  minTime = 2000, // Default 2 seconds minimum
}) => {
  const [timestamp, setTimestamp] = React.useState<number | null>(null);

  React.useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  return (
    <input
      type="hidden"
      name={name}
      value={timestamp || ''}
      data-minduration={minTime}
    />
  );
};

// Honey token - a hidden field with a predictable value that bots might fill
interface HoneyTokenProps {
  name: string;
  value?: string;
}

export const HoneyToken: React.FC<HoneyTokenProps> = ({
  name,
  value = 'http://',
}) => {
  return (
    <input
      type="text"
      name={name}
      defaultValue={value}
      autoComplete="off"
      style={honeypotStyles}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
};

// Combined honeypot component
interface CombinedHoneypotProps {
  websiteFieldName?: string;
  companyFieldName?: string;
  timeFieldName?: string;
  tokenFieldName?: string;
}

export const CombinedHoneypot: React.FC<CombinedHoneypotProps> = ({
  websiteFieldName = 'website_url',
  companyFieldName = 'company_name',
  timeFieldName = 'form_timestamp',
  tokenFieldName = 'homepage',
}) => {
  return (
    <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
      <HoneyToken name={tokenFieldName} />
      <HoneypotField name={websiteFieldName} label="Website (leave empty)" />
      <HoneypotField name={companyFieldName} label="Company (leave empty)" />
      <TimeHoneypot name={timeFieldName} />
    </div>
  );
};

// Server-side validation helper for honeypot
export interface HoneypotValidationResult {
  isValid: boolean;
  triggered: string | null;
}

export const validateHoneypot = (
  formData: FormData,
  options: {
    websiteField?: string;
    companyField?: string;
    timeField?: string;
    tokenField?: string;
    minTime?: number;
  } = {}
): HoneypotValidationResult => {
  const {
    websiteField = 'website_url',
    companyField = 'company_name',
    timeField = 'form_timestamp',
    tokenField = 'homepage',
    minTime = 2000,
  } = options;

  // Check website field (should be empty)
  const website = formData.get(websiteField);
  if (website && typeof website === 'string' && website.length > 0) {
    return { isValid: false, triggered: websiteField };
  }

  // Check company field (should be empty)
  const company = formData.get(companyField);
  if (company && typeof company === 'string' && company.length > 0) {
    return { isValid: false, triggered: companyField };
  }

  // Check token field (should still have original value or be empty)
  const token = formData.get(tokenField);
  if (token && typeof token === 'string' && token !== 'http://' && token !== '') {
    return { isValid: false, triggered: tokenField };
  }

  // Check time field (should not be filled too fast)
  const timestamp = formData.get(timeField);
  if (timestamp && typeof timestamp === 'string') {
    const fillTime = parseInt(timestamp);
    if (!isNaN(fillTime)) {
      const timeDiff = Date.now() - fillTime;
      if (timeDiff < minTime && timeDiff > -1000) { // Allow some clock skew
        return { isValid: false, triggered: 'fast_fill' };
      }
    }
  }

  return { isValid: true, triggered: null };
};

// Export field names for use in server-side validation
export const HONEYPOT_FIELD_NAMES = {
  WEBSITE: 'website_url',
  COMPANY: 'company_name',
  TOKEN: 'homepage',
  TIMESTAMP: 'form_timestamp',
} as const;
