/** Subway Builder Modding API v1.0.0 */

/**
 * A newspaper article template for in-game newspapers.
 *
 * Template variables available in `headline` and `content`:
 * - `{{STATIONS}}` — current station count
 * - `{{ROUTES}}` — current route count
 * - `{{CITY}}` — current city name
 * - `{{PASSENGERS}}` — total passenger count
 * - `{{RIDERSHIP}}` — ridership percentage
 */
export interface NewspaperTemplate {
  /** Article headline. Supports template variables. */
  headline: string;
  /** Article body text. Supports template variables. */
  content: string;
  metadata: {
    /** The editorial category of the article. */
    category: 'milestone' | 'news' | 'opinion';
    /** The editorial tone of the article. */
    tone: 'celebratory' | 'professional' | 'critical';
    /** Conditions that must be met for this template to appear. */
    requiredGameState?: {
      minStations?: number;
      minRoutes?: number;
      minPassengers?: number;
      minMoney?: number;
    };
    /** Selection weight. Higher values make this template more likely to appear. */
    weight: number;
  };
}

/**
 * A social media tweet template for in-game tweets.
 *
 * Template variables available in `text`:
 * - `{{STATIONS}}` — current station count
 * - `{{ROUTES}}` — current route count
 * - `{{CITY}}` — current city name
 * - `{{PASSENGERS}}` — total passenger count
 * - `{{RIDERSHIP}}` — ridership percentage
 */
export interface TweetTemplate {
  /** Tweet text. Supports template variables. */
  text: string;
  /** The tone of the tweet. */
  tone: 'excited' | 'angry' | 'neutral';
  /** Conditions that must be met for this template to appear. */
  requiredGameState?: {
    minStations?: number;
    minRoutes?: number;
    minPassengers?: number;
    minMoney?: number;
  };
}
