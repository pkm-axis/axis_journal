export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AccountType = 'personal' | 'prop_firm' | 'paper';
export type AssetType = 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices';
export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type ChallengeStatus = 'active' | 'passed' | 'failed';
export type MediaType = 'screenshot' | 'chart' | 'annotation';

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					display_name: string | null;
					avatar_url: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name?: string | null;
					avatar_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					display_name?: string | null;
					avatar_url?: string | null;
					updated_at?: string;
				};
			};
			accounts: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					type: AccountType;
					platform: string | null;
					initial_balance: number;
					current_balance: number;
					currency: string;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					type: AccountType;
					platform?: string | null;
					initial_balance: number;
					current_balance?: number;
					currency?: string;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					name?: string;
					type?: AccountType;
					platform?: string | null;
					initial_balance?: number;
					current_balance?: number;
					currency?: string;
					is_active?: boolean;
					updated_at?: string;
				};
			};
			trades: {
				Row: {
					id: string;
					account_id: string;
					user_id: string;
					asset: string;
					asset_type: AssetType;
					direction: TradeDirection;
					entry_price: number;
					exit_price: number | null;
					position_size: number;
					stop_loss: number | null;
					take_profit: number | null;
					fees: number;
					pnl: number | null;
					risk_reward: number | null;
					status: TradeStatus;
					opened_at: string;
					closed_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					account_id: string;
					user_id: string;
					asset: string;
					asset_type: AssetType;
					direction: TradeDirection;
					entry_price: number;
					exit_price?: number | null;
					position_size: number;
					stop_loss?: number | null;
					take_profit?: number | null;
					fees?: number;
					pnl?: number | null;
					risk_reward?: number | null;
					status?: TradeStatus;
					opened_at: string;
					closed_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					account_id?: string;
					asset?: string;
					asset_type?: AssetType;
					direction?: TradeDirection;
					entry_price?: number;
					exit_price?: number | null;
					position_size?: number;
					stop_loss?: number | null;
					take_profit?: number | null;
					fees?: number;
					pnl?: number | null;
					risk_reward?: number | null;
					status?: TradeStatus;
					opened_at?: string;
					closed_at?: string | null;
					updated_at?: string;
				};
			};
			trade_psychology: {
				Row: {
					id: string;
					trade_id: string;
					notes: string | null;
					emotion: string | null;
					confidence_score: number | null;
					followed_plan: boolean | null;
					review_notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					trade_id: string;
					notes?: string | null;
					emotion?: string | null;
					confidence_score?: number | null;
					followed_plan?: boolean | null;
					review_notes?: string | null;
					created_at?: string;
				};
				Update: {
					notes?: string | null;
					emotion?: string | null;
					confidence_score?: number | null;
					followed_plan?: boolean | null;
					review_notes?: string | null;
				};
			};
			strategies: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					created_at?: string;
				};
				Update: {
					name?: string;
					description?: string | null;
				};
			};
			trade_strategies: {
				Row: {
					trade_id: string;
					strategy_id: string;
				};
				Insert: {
					trade_id: string;
					strategy_id: string;
				};
				Update: {
					trade_id?: string;
					strategy_id?: string;
				};
			};
			tags: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					color: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					color?: string | null;
					created_at?: string;
				};
				Update: {
					name?: string;
					color?: string | null;
				};
			};
			trade_tags: {
				Row: {
					trade_id: string;
					tag_id: string;
				};
				Insert: {
					trade_id: string;
					tag_id: string;
				};
				Update: {
					trade_id?: string;
					tag_id?: string;
				};
			};
			mistakes: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					created_at?: string;
				};
				Update: {
					name?: string;
					description?: string | null;
				};
			};
			trade_mistakes: {
				Row: {
					trade_id: string;
					mistake_id: string;
				};
				Insert: {
					trade_id: string;
					mistake_id: string;
				};
				Update: {
					trade_id?: string;
					mistake_id?: string;
				};
			};
			trade_media: {
				Row: {
					id: string;
					trade_id: string;
					storage_path: string;
					caption: string | null;
					type: MediaType;
					created_at: string;
				};
				Insert: {
					id?: string;
					trade_id: string;
					storage_path: string;
					caption?: string | null;
					type?: MediaType;
					created_at?: string;
				};
				Update: {
					storage_path?: string;
					caption?: string | null;
					type?: MediaType;
				};
			};
			prop_firm_rules: {
				Row: {
					id: string;
					account_id: string;
					max_daily_loss: number | null;
					max_drawdown: number | null;
					profit_target: number | null;
					min_trading_days: number | null;
					challenge_start: string | null;
					challenge_end: string | null;
					status: ChallengeStatus;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					account_id: string;
					max_daily_loss?: number | null;
					max_drawdown?: number | null;
					profit_target?: number | null;
					min_trading_days?: number | null;
					challenge_start?: string | null;
					challenge_end?: string | null;
					status?: ChallengeStatus;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					max_daily_loss?: number | null;
					max_drawdown?: number | null;
					profit_target?: number | null;
					min_trading_days?: number | null;
					challenge_start?: string | null;
					challenge_end?: string | null;
					status?: ChallengeStatus;
					updated_at?: string;
				};
			};
			daily_performance: {
				Row: {
					id: string;
					account_id: string;
					date: string;
					pnl: number;
					cumulative_pnl: number;
					drawdown: number;
					trade_count: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					account_id: string;
					date: string;
					pnl?: number;
					cumulative_pnl?: number;
					drawdown?: number;
					trade_count?: number;
					created_at?: string;
				};
				Update: {
					pnl?: number;
					cumulative_pnl?: number;
					drawdown?: number;
					trade_count?: number;
				};
			};
		};
		Enums: {
			account_type: AccountType;
			asset_type: AssetType;
			trade_direction: TradeDirection;
			trade_status: TradeStatus;
			challenge_status: ChallengeStatus;
			media_type: MediaType;
		};
	};
}
