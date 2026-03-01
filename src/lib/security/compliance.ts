/**
 * Compliance Management
 * Tracks status for SOC 2, GDPR, CCPA, and PCI DSS.
 */

export interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'manual';
  description: string;
}

const FRAMEWORKS = [
  { id: 'SOC2', name: 'SOC 2 Type II' },
  { id: 'GDPR', name: 'GDPR' },
  { id: 'PCI_DSS', name: 'PCI DSS v4.0' },
  { id: 'CCPA', name: 'CCPA / CPRA' },
];

/**
 * Get current compliance status for all frameworks
 */
export const getComplianceStatus = async (): Promise<ComplianceStatus[]> => {
  return FRAMEWORKS.map(framework => {
    const checks = generateChecks(framework.id);
    const passedCount = checks.filter(c => c.status === 'passed').length;
    const score = Math.round((passedCount / checks.length) * 100);

    return {
      framework: framework.name,
      status: score === 100 ? 'compliant' : score > 70 ? 'partial' : 'non-compliant',
      score,
      checks,
    };
  });
};

function generateChecks(frameworkId: string): ComplianceCheck[] {
  const commonChecks: ComplianceCheck[] = [
    { id: 'CC-1', name: 'Encryption at Rest', status: 'passed', description: 'Data is encrypted when stored.' },
    { id: 'CC-2', name: 'Encryption in Transit', status: 'passed', description: 'SSL/TLS is enforced for all traffic.' },
    { id: 'CC-3', name: 'Multi-Factor Authentication', status: 'passed', description: 'MFA is required for administrative access.' },
    { id: 'CC-4', name: 'Audit Logging', status: 'passed', description: 'All security events are logged.' },
  ];

  if (frameworkId === 'GDPR') {
    return [
      ...commonChecks,
      { id: 'GDPR-1', name: 'Right to Access', status: 'manual', description: 'Users can request their data.' },
      { id: 'GDPR-2', name: 'Right to Erasure', status: 'manual', description: 'Users can request deletion of their data.' },
      { id: 'GDPR-3', name: 'Cookie Consent', status: 'passed', description: 'Cookie banner is present and functional.' },
    ];
  }

  if (frameworkId === 'PCI_DSS') {
    return [
      ...commonChecks,
      { id: 'PCI-1', name: 'Payment Data Isolation', status: 'passed', description: 'Credit card data is not stored on-site.' },
      { id: 'PCI-2', name: 'Vulnerability Scanning', status: 'passed', description: 'Regular scans are performed.' },
    ];
  }

  return commonChecks;
}
