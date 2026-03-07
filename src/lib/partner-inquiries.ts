import fs from "fs";
import path from "path";

export type PartnerInquiryType = "advertise" | "sponsor";

export interface PartnerInquiryInput {
  inquiryType: PartnerInquiryType;
  companyName: string;
  contactName: string;
  email: string;
  websiteUrl: string;
  packageInterest?: string;
  monthlyBudget?: string;
  message: string;
  locale: string;
}

export interface PartnerInquiryRecord extends PartnerInquiryInput {
  id: string;
  status: "new" | "reviewed";
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "partner-inquiries.json");

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readRecords(): PartnerInquiryRecord[] {
  ensureDataFile();

  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as PartnerInquiryRecord[];
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

function writeRecords(records: PartnerInquiryRecord[]) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

export async function recordPartnerInquiry(input: PartnerInquiryInput): Promise<PartnerInquiryRecord> {
  const records = readRecords();
  const record: PartnerInquiryRecord = {
    ...input,
    id: `partner_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);
  writeRecords(records);
  return record;
}

export async function listPartnerInquiries(): Promise<PartnerInquiryRecord[]> {
  return readRecords();
}
