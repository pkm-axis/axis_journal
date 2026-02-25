-- ============================================
-- Axis Journal - Initial Schema Migration
-- ============================================

-- Custom enums
CREATE TYPE account_type AS ENUM ('personal', 'prop_firm', 'paper');
CREATE TYPE asset_type AS ENUM ('stocks', 'crypto', 'forex', 'commodities', 'indices');
CREATE TYPE trade_direction AS ENUM ('long', 'short');
CREATE TYPE trade_status AS ENUM ('open', 'closed');
CREATE TYPE challenge_status AS ENUM ('active', 'passed', 'failed');
CREATE TYPE media_type AS ENUM ('screenshot', 'chart', 'annotation');

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ACCOUNTS
-- ============================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type account_type NOT NULL,
    platform TEXT,
    initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
    ON accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts"
    ON accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
    ON accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
    ON accounts FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRADES
-- ============================================
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    asset TEXT NOT NULL,
    asset_type asset_type NOT NULL,
    direction trade_direction NOT NULL,
    entry_price NUMERIC(18,8) NOT NULL,
    exit_price NUMERIC(18,8),
    position_size NUMERIC(18,8) NOT NULL,
    stop_loss NUMERIC(18,8),
    take_profit NUMERIC(18,8),
    fees NUMERIC(15,2) NOT NULL DEFAULT 0,
    pnl NUMERIC(15,2),
    risk_reward NUMERIC(8,2),
    status trade_status NOT NULL DEFAULT 'open',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_account_id ON trades(account_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_opened_at ON trades(opened_at);
CREATE INDEX idx_trades_asset_type ON trades(asset_type);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
    ON trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trades"
    ON trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
    ON trades FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
    ON trades FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRADE PSYCHOLOGY
-- ============================================
CREATE TABLE trade_psychology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
    notes TEXT,
    emotion TEXT,
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 5),
    followed_plan BOOLEAN,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trade_psychology_trade_id ON trade_psychology(trade_id);

ALTER TABLE trade_psychology ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade psychology"
    ON trade_psychology FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_psychology.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can create own trade psychology"
    ON trade_psychology FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_psychology.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own trade psychology"
    ON trade_psychology FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_psychology.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own trade psychology"
    ON trade_psychology FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_psychology.trade_id AND trades.user_id = auth.uid()
    ));

-- ============================================
-- STRATEGIES
-- ============================================
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_strategies_user_id ON strategies(user_id);

ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategies"
    ON strategies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own strategies"
    ON strategies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strategies"
    ON strategies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strategies"
    ON strategies FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRADE <-> STRATEGIES (many-to-many)
-- ============================================
CREATE TABLE trade_strategies (
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    PRIMARY KEY (trade_id, strategy_id)
);

ALTER TABLE trade_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade strategies"
    ON trade_strategies FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_strategies.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own trade strategies"
    ON trade_strategies FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_strategies.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own trade strategies"
    ON trade_strategies FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_strategies.trade_id AND trades.user_id = auth.uid()
    ));

-- ============================================
-- TAGS
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
    ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tags"
    ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags"
    ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags"
    ON tags FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRADE <-> TAGS (many-to-many)
-- ============================================
CREATE TABLE trade_tags (
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (trade_id, tag_id)
);

ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade tags"
    ON trade_tags FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_tags.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own trade tags"
    ON trade_tags FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_tags.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own trade tags"
    ON trade_tags FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_tags.trade_id AND trades.user_id = auth.uid()
    ));

-- ============================================
-- MISTAKES
-- ============================================
CREATE TABLE mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mistakes_user_id ON mistakes(user_id);

ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mistakes"
    ON mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own mistakes"
    ON mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mistakes"
    ON mistakes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mistakes"
    ON mistakes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRADE <-> MISTAKES (many-to-many)
-- ============================================
CREATE TABLE trade_mistakes (
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    mistake_id UUID NOT NULL REFERENCES mistakes(id) ON DELETE CASCADE,
    PRIMARY KEY (trade_id, mistake_id)
);

ALTER TABLE trade_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade mistakes"
    ON trade_mistakes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_mistakes.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own trade mistakes"
    ON trade_mistakes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_mistakes.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own trade mistakes"
    ON trade_mistakes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_mistakes.trade_id AND trades.user_id = auth.uid()
    ));

-- ============================================
-- TRADE MEDIA
-- ============================================
CREATE TABLE trade_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    type media_type NOT NULL DEFAULT 'screenshot',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trade_media_trade_id ON trade_media(trade_id);

ALTER TABLE trade_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade media"
    ON trade_media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_media.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can create own trade media"
    ON trade_media FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_media.trade_id AND trades.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own trade media"
    ON trade_media FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM trades WHERE trades.id = trade_media.trade_id AND trades.user_id = auth.uid()
    ));

-- ============================================
-- PROP FIRM RULES
-- ============================================
CREATE TABLE prop_firm_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    max_daily_loss NUMERIC(15,2),
    max_drawdown NUMERIC(15,2),
    profit_target NUMERIC(15,2),
    min_trading_days INTEGER,
    challenge_start DATE,
    challenge_end DATE,
    status challenge_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE prop_firm_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prop firm rules"
    ON prop_firm_rules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM accounts WHERE accounts.id = prop_firm_rules.account_id AND accounts.user_id = auth.uid()
    ));

CREATE POLICY "Users can create own prop firm rules"
    ON prop_firm_rules FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM accounts WHERE accounts.id = prop_firm_rules.account_id AND accounts.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own prop firm rules"
    ON prop_firm_rules FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM accounts WHERE accounts.id = prop_firm_rules.account_id AND accounts.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own prop firm rules"
    ON prop_firm_rules FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM accounts WHERE accounts.id = prop_firm_rules.account_id AND accounts.user_id = auth.uid()
    ));

-- ============================================
-- DAILY PERFORMANCE
-- ============================================
CREATE TABLE daily_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pnl NUMERIC(15,2) NOT NULL DEFAULT 0,
    cumulative_pnl NUMERIC(15,2) NOT NULL DEFAULT 0,
    drawdown NUMERIC(15,2) NOT NULL DEFAULT 0,
    trade_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(account_id, date)
);

CREATE INDEX idx_daily_performance_account_date ON daily_performance(account_id, date);

ALTER TABLE daily_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily performance"
    ON daily_performance FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM accounts WHERE accounts.id = daily_performance.account_id AND accounts.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own daily performance"
    ON daily_performance FOR ALL
    USING (EXISTS (
        SELECT 1 FROM accounts WHERE accounts.id = daily_performance.account_id AND accounts.user_id = auth.uid()
    ));

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-calculate P&L when trade is closed
CREATE OR REPLACE FUNCTION calculate_trade_pnl()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND NEW.exit_price IS NOT NULL THEN
        IF NEW.direction = 'long' THEN
            NEW.pnl := (NEW.exit_price - NEW.entry_price) * NEW.position_size - NEW.fees;
        ELSE
            NEW.pnl := (NEW.entry_price - NEW.exit_price) * NEW.position_size - NEW.fees;
        END IF;

        IF NEW.stop_loss IS NOT NULL AND NEW.stop_loss != NEW.entry_price THEN
            DECLARE
                risk NUMERIC;
                reward NUMERIC;
            BEGIN
                IF NEW.direction = 'long' THEN
                    risk := (NEW.entry_price - NEW.stop_loss) * NEW.position_size;
                    reward := (NEW.exit_price - NEW.entry_price) * NEW.position_size;
                ELSE
                    risk := (NEW.stop_loss - NEW.entry_price) * NEW.position_size;
                    reward := (NEW.entry_price - NEW.exit_price) * NEW.position_size;
                END IF;
                IF risk > 0 THEN
                    NEW.risk_reward := ROUND(reward / risk, 2);
                END IF;
            END;
        END IF;

        NEW.closed_at := COALESCE(NEW.closed_at, now());
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_trade_pnl
    BEFORE INSERT OR UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION calculate_trade_pnl();

-- Update account balance after trade closes
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND (OLD IS NULL OR OLD.status = 'open') AND NEW.pnl IS NOT NULL THEN
        UPDATE accounts
        SET current_balance = current_balance + NEW.pnl,
            updated_at = now()
        WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Update daily performance after trade closes
CREATE OR REPLACE FUNCTION update_daily_performance()
RETURNS TRIGGER AS $$
DECLARE
    trade_date DATE;
    acct_cumulative NUMERIC;
    acct_peak NUMERIC;
BEGIN
    IF NEW.status = 'closed' AND (OLD IS NULL OR OLD.status = 'open') AND NEW.pnl IS NOT NULL THEN
        trade_date := COALESCE(NEW.closed_at::date, CURRENT_DATE);

        INSERT INTO daily_performance (account_id, date, pnl, trade_count)
        VALUES (NEW.account_id, trade_date, NEW.pnl, 1)
        ON CONFLICT (account_id, date)
        DO UPDATE SET
            pnl = daily_performance.pnl + EXCLUDED.pnl,
            trade_count = daily_performance.trade_count + 1;

        SELECT COALESCE(SUM(pnl), 0) INTO acct_cumulative
        FROM daily_performance
        WHERE account_id = NEW.account_id;

        SELECT COALESCE(MAX(cumulative_pnl), 0) INTO acct_peak
        FROM daily_performance
        WHERE account_id = NEW.account_id;

        UPDATE daily_performance
        SET cumulative_pnl = acct_cumulative,
            drawdown = GREATEST(0, acct_peak - acct_cumulative)
        WHERE account_id = NEW.account_id AND date = trade_date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_daily_performance
    AFTER INSERT OR UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_daily_performance();

-- Updated_at trigger for profiles and accounts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_prop_firm_rules_updated_at
    BEFORE UPDATE ON prop_firm_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-media', 'trade-media', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload trade media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'trade-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own trade media"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'trade-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own trade media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'trade-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
