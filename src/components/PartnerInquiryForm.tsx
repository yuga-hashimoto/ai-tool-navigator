"use client";

import { useState } from "react";

interface PartnerInquiryFormProps {
  inquiryType: "advertise" | "sponsor";
  locale: string;
  packageOptions: string[];
}

export function PartnerInquiryForm({
  inquiryType,
  locale,
  packageOptions,
}: PartnerInquiryFormProps) {
  const isJapanese = locale === "ja";
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    websiteUrl: "",
    packageInterest: packageOptions[0] || "",
    monthlyBudget: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const copy = isJapanese
    ? {
        companyName: "会社名",
        contactName: "担当者名",
        email: "連絡先メールアドレス",
        websiteUrl: "WebサイトURL",
        packageInterest: "希望プラン",
        monthlyBudget: "想定月額予算",
        message: "相談内容",
        submit: "問い合わせを送信",
        submitting: "送信中...",
        success: "送信を受け付けました。通常1〜2営業日以内に確認します。",
        error: "送信に失敗しました。時間をおいて再度お試しください。",
        placeholderCompany: "例: Acme AI Inc.",
        placeholderName: "例: 山田 太郎",
        placeholderWebsite: "https://example.com",
        placeholderBudget: "例: 1000 USD / 15万円",
        placeholderMessage: "掲載したいツール、想定した露出枠、目標などを記載してください。",
      }
    : {
        companyName: "Company name",
        contactName: "Contact name",
        email: "Email",
        websiteUrl: "Website URL",
        packageInterest: "Package interest",
        monthlyBudget: "Monthly budget",
        message: "Campaign goals",
        submit: "Send inquiry",
        submitting: "Sending...",
        success: "Your inquiry has been received. We usually review it within 1-2 business days.",
        error: "Failed to send inquiry. Please try again shortly.",
        placeholderCompany: "Acme AI Inc.",
        placeholderName: "Jane Doe",
        placeholderWebsite: "https://example.com",
        placeholderBudget: "e.g. $1,000 / month",
        placeholderMessage: "Tell us what you want to promote, the placements you care about, and your goals.",
      };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/partner-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          inquiryType,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      setForm({
        companyName: "",
        contactName: "",
        email: "",
        websiteUrl: "",
        packageInterest: packageOptions[0] || "",
        monthlyBudget: "",
        message: "",
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.companyName}
          </span>
          <input
            value={form.companyName}
            onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
            placeholder={copy.placeholderCompany}
            required
          />
        </label>

        <label>
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.contactName}
          </span>
          <input
            value={form.contactName}
            onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
            placeholder={copy.placeholderName}
            required
          />
        </label>

        <label>
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.email}
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
            placeholder="you@company.com"
            required
          />
        </label>

        <label className="sm:col-span-2">
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.websiteUrl}
          </span>
          <input
            type="url"
            value={form.websiteUrl}
            onChange={(event) => setForm((current) => ({ ...current, websiteUrl: event.target.value }))}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
            placeholder={copy.placeholderWebsite}
            required
          />
        </label>

        <label>
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.packageInterest}
          </span>
          <select
            value={form.packageInterest}
            onChange={(event) => setForm((current) => ({ ...current, packageInterest: event.target.value }))}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
          >
            {packageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.monthlyBudget}
          </span>
          <input
            value={form.monthlyBudget}
            onChange={(event) => setForm((current) => ({ ...current, monthlyBudget: event.target.value }))}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
            placeholder={copy.placeholderBudget}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            {copy.message}
          </span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            rows={5}
            className="mt-2.5 block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
            placeholder={copy.placeholderMessage}
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? copy.submitting : copy.submit}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">{copy.success}</p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{copy.error}</p>
      )}
    </form>
  );
}
