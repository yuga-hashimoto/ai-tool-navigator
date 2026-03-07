# Use a lightweight Node.js image
FROM public.ecr.aws/docker/library/node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GRID
ENV NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GRID=$NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GRID
ARG NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_CONTENT
ENV NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_CONTENT=$NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_CONTENT
ARG NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR
ENV NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR=$NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR
ARG NEXT_PUBLIC_GOOGLE_GAM_NETWORK_ID
ENV NEXT_PUBLIC_GOOGLE_GAM_NETWORK_ID=$NEXT_PUBLIC_GOOGLE_GAM_NETWORK_ID
ARG NEXT_PUBLIC_GOOGLE_GAM_SLOT_GRID
ENV NEXT_PUBLIC_GOOGLE_GAM_SLOT_GRID=$NEXT_PUBLIC_GOOGLE_GAM_SLOT_GRID
ARG NEXT_PUBLIC_GOOGLE_GAM_SLOT_CONTENT
ENV NEXT_PUBLIC_GOOGLE_GAM_SLOT_CONTENT=$NEXT_PUBLIC_GOOGLE_GAM_SLOT_CONTENT
ARG NEXT_PUBLIC_GOOGLE_GAM_SLOT_SIDEBAR
ENV NEXT_PUBLIC_GOOGLE_GAM_SLOT_SIDEBAR=$NEXT_PUBLIC_GOOGLE_GAM_SLOT_SIDEBAR
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN
ARG NODE_OPTIONS=--max-old-space-size=4096
ENV NODE_OPTIONS=$NODE_OPTIONS

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
