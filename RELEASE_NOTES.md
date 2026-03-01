# Axis Journal - Release Notes

---

## v0.2.0

### Rich Text Strategies

- Strategy descriptions now support rich text formatting (bold, italic, underline, strikethrough, headings, lists, blockquotes, links, text alignment, highlights)
- Edit strategies inline with the new rich text editor
- Tiptap-powered editor with a clean, Simple Editor-inspired toolbar

### Improved Sidebar

- Replaced custom sidebar with shadcn-svelte Sidebar component
- Collapsible sidebar with icon-only mode
- Sidebar state persists across sessions via cookies
- Moved sidebar toggle into sidebar footer

### Form Persistence

- Trade logging form inputs are now saved to local storage
- Form data persists across page refreshes
- Draft is automatically cleared on successful trade submission

### Responsive Design

- Mobile-friendly layouts across all pages
- Responsive headings, grids, and form layouts
- Fixed-width selects and inputs adapt to screen size
- Improved spacing and padding on smaller devices

---

# v0.1.0

## Authentication

- Email/password sign up and sign in
- Google and GitHub OAuth login
- Automatic profile creation on sign up
- Persistent sessions with secure cookie handling

## Multi-Account System

- Create and manage Personal, Prop Firm, and Paper Trading accounts
- Track balance, platform, and currency per account
- View P&L growth from initial balance
- Edit, archive, and delete accounts

## Trade Logging

- Log trades with asset, asset type (stocks, crypto, forex, commodities, indices), direction (long/short), entry/exit prices, position size, stop loss, take profit, and fees
- P&L and risk-reward ratio auto-calculated on trade close via database triggers
- Close open trades from the trade detail page with exit price
- Edit and delete trades
- Filter trade list by account, asset type, and status

## Strategy & Tag System

- Create and manage trading strategies (e.g. breakout, scalping)
- Create color-coded tags for flexible trade categorization
- Attach multiple strategies and tags to any trade (many-to-many)
- View trade count per strategy

## Psychology & Trade Review

- Track emotion on each trade (confident, fearful, greedy, FOMO, etc.)
- Rate confidence from 1 to 5
- Mark whether you followed your trading plan
- Add entry reasoning notes
- Write post-trade reviews on the trade detail page

## Mistake Tracking

- Define personal trading mistakes (e.g. "no stop loss", "FOMO entry")
- Attach mistakes to trades
- View occurrence count and total loss per mistake
- See recent trades associated with each mistake

## Trade Media

- Upload screenshots and charts to trades via drag-and-drop
- Image gallery on trade detail page with lightbox viewer
- Per-image delete
- Stored in Supabase Storage with per-user folder security

## Analytics Dashboard

- Key metrics: total P&L, win rate, expectancy, max drawdown, profit factor, avg win/loss, avg risk-reward
- Cumulative P&L line chart
- P&L breakdown by asset type (bar chart)
- Long vs short performance comparison
- Filter by account, asset type, strategy, and date range

## Daily Performance Tracking

- Automatic daily P&L aggregation via database triggers on trade close
- Cumulative P&L and drawdown tracked per day per account
- 30-day performance chart on the dashboard

## Prop Firm Rule Tracking

- Configure max daily loss, max drawdown, profit target, and minimum trading days
- Set challenge start/end dates and status (active/passed/failed)
- Real-time rule monitoring with progress bars
- Violation warnings when rules are breached
- Challenge timeline progress indicator

## Cross-Account Insights

- Side-by-side comparison table across all accounts
- Behavioral insights: paper vs real win rate, mistake frequency, plan adherence
- Paper trading readiness scoring with 5 criteria checklist
- "Ready to go live" signal when criteria are met

## App Shell & Settings

- Collapsible sidebar navigation with mobile responsive hamburger menu
- Dark/light mode toggle
- User profile settings (display name)
- Dashboard with getting-started guide for new users
