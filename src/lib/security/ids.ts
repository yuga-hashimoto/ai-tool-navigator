/**
 * Intrusion Detection System (IDS)
 * Detects common web attacks like SQL Injection, XSS, and Path Traversal.
 */

export interface IDSResult {
  detected: boolean;
  type?: string;
  confidence: number;
  description?: string;
}

const ATTACK_PATTERNS = {
  SQL_INJECTION: [
    /(\%27)|(\')\s+(or|and|union|select|insert|update|delete|drop|alter)\b/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\b(select|insert|update|delete|drop|alter|union)\b.*\bfrom\b/i,
    /\b(select|insert|update|delete|drop|alter|union)\b.*\binto\b/i,
    /\b(select|insert|update|delete|drop|alter|union)\b.*\bwhere\b/i,
  ],
  XSS: [
    /<script.*?>/i,
    /javascript:/i,
    /on\w+s*=/i,
    /<iframe.*?>/i,
    /<img.*?onerror/i,
    /eval\(.*?\)/i,
    /document\.(cookie|location|write)/i,
  ],
  PATH_TRAVERSAL: [
    /\.\.\//,
    /\.\.\\/,
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /c:\\windows\\system32/i,
    /boot\.ini/i,
  ],
  COMMAND_INJECTION: [
    /(;|\||&)\s*(ls|cat|whoami|pwd|ifconfig|netstat|ping|wget|curl|sh|bash|powershell|cmd)/i,
    /`.*?`/i,
    /\$\(.*?\)/i,
  ],
};

/**
 * Scan a string for potential attack patterns
 */
export const scanString = (input: string): IDSResult[] => {
  const findings: IDSResult[] = [];

  let decodedInput = input;
  try {
    decodedInput = decodeURIComponent(input);
  } catch (e) {
    // If decoding fails, we just use the original input
    // and potentially log it as a malformed request
  }

  for (const [type, patterns] of Object.entries(ATTACK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(input) || pattern.test(decodedInput)) {
        findings.push({
          detected: true,
          type,
          confidence: 0.8, // Basic signature-based confidence
          description: `Detected potential ${type} pattern: ${pattern.source}`,
        });
      }
    }
  }

  return findings;
};

/**
 * Scan an object (like request body or query params) for potential attack patterns
 */
export const scanObject = (obj: any): IDSResult[] => {
  let allFindings: IDSResult[] = [];

  const traverse = (item: any) => {
    if (typeof item === 'string') {
      allFindings = [...allFindings, ...scanString(item)];
    } else if (typeof item === 'object' && item !== null) {
      for (const key in item) {
        traverse(item[key]);
      }
    }
  };

  traverse(obj);
  return allFindings;
};

/**
 * Main entry point for IDS scanning
 */
export const detectIntrusion = async (request: {
  body?: any;
  query?: any;
  headers?: any;
  path: string;
  method?: string;
}): Promise<IDSResult[]> => {
  const findings: IDSResult[] = [];

  // Scan path
  findings.push(...scanString(request.path));

  // Scan query params
  if (request.query) {
    findings.push(...scanObject(request.query));
  }

  // Scan body
  if (request.body) {
    findings.push(...scanObject(request.body));
  }

  // Scan specific headers if needed (e.g., User-Agent, Referer)
  if (request.headers) {
    const sensitiveHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
    for (const header of sensitiveHeaders) {
      if (request.headers[header]) {
        findings.push(...scanString(request.headers[header]));
      }
    }
  }

  return findings;
};
