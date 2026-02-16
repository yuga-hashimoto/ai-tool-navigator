This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Google Sheets Integration

The application integrates with Google Sheets to store newsletter subscribers and tool submissions.

### Prerequisites

1.  **Google Cloud Project**: You can use the same project as your deployment or a separate one.
2.  **Service Account**:
    -   Create a Service Account in your GCP project.
    -   Enable the **Google Sheets API**.
    -   Create and download a JSON key for this Service Account.
3.  **Google Sheet**:
    -   Create a new Google Sheet.
    -   Share the sheet with the Service Account's email address (found in the JSON key file, `client_email` field) with "Editor" access.
    -   Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`.

### Configuration

You need to set two environment variables:

-   `GOOGLE_SERVICE_ACCOUNT_JSON`: The full content of the downloaded JSON key file.
    -   **Local Development**: Add this to your `.env.local` file. Since it's a multi-line JSON, ensure it is properly escaped or kept as a single line string.
    -   **Deployment (Cloud Run)**: Add this environment variable to your Cloud Run service via the Console or `gcloud` CLI.

-   `GOOGLE_SHEET_ID`: The ID of the Google Sheet you created.

## CI/CD Setup for Google Cloud Run

This repository is configured with a GitHub Actions workflow to automatically build and deploy the Next.js application to Google Cloud Run.

### Prerequisites

1.  **Google Cloud Platform (GCP) Project**:
    -   Ensure you have a GCP project.
    -   Enable the **Cloud Run API**.

2.  **Service Account**:
    -   Create a Service Account in your GCP project.
    -   Grant the following roles to the Service Account:
        -   **Cloud Run Developer**: To deploy services.
        -   **Service Account User**: To act as the service account.
    -   Create and download a JSON key key for this Service Account.

3.  **GitHub Packages (ghcr.io)**:
    -   The workflow pushes the Docker image to GitHub Container Registry.
    -   **Important**: Ensure your GitHub Package visibility is set to **Public** so that Cloud Run can pull the image without additional authentication configuration. Alternatively, you can configure Cloud Run with image pull secrets for private packages.

### GitHub Secrets Configuration

Go to your repository's **Settings** > **Secrets and variables** > **Actions** and add the following secrets:

-   `GCP_PROJECT_ID`: Your Google Cloud Project ID (e.g., `Hashimoto620`).
-   `GCP_SA_KEY`: The content of the JSON key file you downloaded for the Service Account.

### Database Setup (Supabase / PostgreSQL)

This setup assumes you are using a PostgreSQL-compatible database (e.g., Supabase Free Tier).

1.  Obtain your `DATABASE_URL` from your provider (e.g., Supabase).
2.  Add the `DATABASE_URL` environment variable to your Cloud Run service:
    -   You can do this via the Google Cloud Console UI when editing the service.
    -   Or add it to the `env_vars` section in `.github/workflows/deploy.yml` (not recommended for sensitive values).
    -   **Best Practice**: Store `DATABASE_URL` in Google Secret Manager and reference it in Cloud Run.

### Usage

Every push to the `main` branch will trigger the workflow:
1.  Build the Docker image.
2.  Push the image to `ghcr.io/<your-username>/<repo-name>`.
3.  Deploy the new image to Cloud Run service `ai-tool-navigator`.
