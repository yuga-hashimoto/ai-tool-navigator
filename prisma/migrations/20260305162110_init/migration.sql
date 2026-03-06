-- CreateTable
CREATE TABLE "abandoned_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "visitor_email" TEXT,
    "affiliate_id" TEXT NOT NULL,
    "tool_slug" TEXT NOT NULL,
    "tool_name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "medium" TEXT NOT NULL DEFAULT 'referral',
    "campaign" TEXT,
    "entry_page" TEXT NOT NULL,
    "exit_page" TEXT NOT NULL,
    "time_on_page" INTEGER NOT NULL DEFAULT 0,
    "scroll_depth" INTEGER,
    "click_position" TEXT,
    "abandonment_type" TEXT NOT NULL,
    "recovery_status" TEXT NOT NULL DEFAULT 'pending',
    "recovery_channel" TEXT,
    "recovery_email_sent_at" DATETIME,
    "recovery_clicked_at" DATETIME,
    "recovery_converted_at" DATETIME,
    "recovery_attempts" INTEGER NOT NULL DEFAULT 0,
    "total_value" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "visitor_email" TEXT,
    "items" TEXT NOT NULL,
    "total_value" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "affiliate_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "recovery_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "recovery_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "abandoned_link_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_at" DATETIME,
    "clicked_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'sent'
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "visitor_id" TEXT,
    "visitor_name" TEXT,
    "visitor_email" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assigned_to" TEXT,
    "subject" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "closed_at" DATETIME
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chat_session_id" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "sender_id" TEXT,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'TEXT',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_chat_session_id_fkey" FOREIGN KEY ("chat_session_id") REFERENCES "chat_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_number" TEXT NOT NULL,
    "chat_session_id" TEXT,
    "visitor_id" TEXT,
    "visitor_name" TEXT,
    "visitor_email" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assigned_to" TEXT,
    "resolution" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "resolved_at" DATETIME,
    CONSTRAINT "support_tickets_chat_session_id_fkey" FOREIGN KEY ("chat_session_id") REFERENCES "chat_sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "canned_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "keywords" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "chat_transcripts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chat_session_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "exported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exported_by" TEXT,
    CONSTRAINT "chat_transcripts_chat_session_id_fkey" FOREIGN KEY ("chat_session_id") REFERENCES "chat_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_widget_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "context" TEXT,
    "userId" TEXT,
    "url" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT,
    "price" TEXT,
    "currency" TEXT DEFAULT 'USD',
    "tags" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "user_id" TEXT,
    "product_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_interactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "priceYearly" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" TEXT NOT NULL,
    "limits" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripe_product_id" TEXT,
    "stripe_price_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "current_period_start" DATETIME,
    "current_period_end" DATETIME,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_subscriptions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "subscription_tiers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_links_session_id_key" ON "abandoned_links"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_session_id_key" ON "abandoned_carts"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_sessions_sessionId_key" ON "chat_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "messages_chat_session_id_idx" ON "messages"("chat_session_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_chat_session_id_key" ON "support_tickets"("chat_session_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_created_at_idx" ON "support_tickets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_transcripts_chat_session_id_key" ON "chat_transcripts"("chat_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_widget_settings_key_key" ON "chat_widget_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "user_interactions_session_id_idx" ON "user_interactions"("session_id");

-- CreateIndex
CREATE INDEX "user_interactions_product_id_idx" ON "user_interactions"("product_id");

-- CreateIndex
CREATE INDEX "user_interactions_type_idx" ON "user_interactions"("type");

-- CreateIndex
CREATE INDEX "user_interactions_created_at_idx" ON "user_interactions"("created_at");

-- CreateIndex
CREATE INDEX "orders_session_id_idx" ON "orders"("session_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_tiers_slug_key" ON "subscription_tiers"("slug");

-- CreateIndex
CREATE INDEX "subscription_tiers_slug_idx" ON "subscription_tiers"("slug");

-- CreateIndex
CREATE INDEX "subscription_tiers_isActive_idx" ON "subscription_tiers"("isActive");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_id_idx" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_stripe_subscription_id_idx" ON "user_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");
