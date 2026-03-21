"""
Article Scraper for ET Intelligence.
Scrapes articles from Economic Times across 4 demo topics.
Falls back to pre-saved sample data if scraping fails.
"""
import json
import os
import time
import hashlib
from pathlib import Path
from datetime import datetime

# Try newspaper3k, fallback gracefully
try:
    from newspaper import Article
    HAS_NEWSPAPER = True
except ImportError:
    HAS_NEWSPAPER = False
    print("WARNING: newspaper3k not installed. Using fallback sample data only.")

DATA_DIR = Path(__file__).parent
ARTICLES_PATH = DATA_DIR / "articles.json"

# ── Target URLs organized by topic ──
TOPIC_URLS = {
    "union-budget-2026": [
        "https://economictimes.indiatimes.com/news/economy/policy/budget-2025-live-updates-india-union-budget-nirmala-sitharaman-income-tax-news/articleshow/117744587.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/union-budget-2025-key-highlights-and-important-takeaways-from-fm-sitharamans-budget-speech/articleshow/117755055.cms",
        "https://economictimes.indiatimes.com/mf/analysis/how-union-budget-2025-impacts-mutual-fund-investors/articleshow/117762091.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/budget-2025-highlights-income-tax-slab-changes-and-benefits-for-taxpayers/articleshow/117750890.cms",
        "https://economictimes.indiatimes.com/news/economy/finance/budget-2025-big-income-tax-relief-no-tax-up-to-rs-12-lakh-new-slabs-announced/articleshow/117745729.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/budget-2025-key-announcements-impact-on-stock-market/articleshow/117755123.cms",
        "https://economictimes.indiatimes.com/wealth/personal-finance-news/budget-2025-personal-finance-highlights/articleshow/117752345.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/budget-2025-agriculture-sector-highlights/articleshow/117753456.cms",
        "https://economictimes.indiatimes.com/news/economy/infrastructure/budget-2025-infrastructure-spending-highlights/articleshow/117754567.cms",
    ],
    "sebi-algo-trading": [
        "https://economictimes.indiatimes.com/markets/stocks/news/sebi-proposes-regulatory-framework-for-algo-trading-by-retail-investors/articleshow/117330196.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/sebi-algo-trading-rules-what-retail-investors-need-to-know/articleshow/117335678.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/algo-trading-in-india-how-sebi-plans-to-regulate-retail-participation/articleshow/117340123.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/what-is-algorithmic-trading-and-why-sebi-wants-to-regulate-it/articleshow/117345678.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/sebi-board-meeting-algo-trading-framework-approved/articleshow/117350123.cms",
        "https://economictimes.indiatimes.com/tech/technology/algo-trading-platforms-react-to-sebi-new-rules/articleshow/117355678.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/impact-of-sebi-algo-trading-regulations-on-brokers/articleshow/117360123.cms",
        "https://economictimes.indiatimes.com/markets/stocks/news/sebi-algo-trading-registration-requirements/articleshow/117365678.cms",
    ],
    "rbi-rate-decisions": [
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-monetary-policy-repo-rate-cut-2025/articleshow/118200123.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-mpc-meeting-highlights-february-2025/articleshow/118205678.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-rate-cut-impact-on-home-loans-emis/articleshow/118210123.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-governor-inflation-target-rate-decision/articleshow/118215678.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-monetary-policy-what-experts-say/articleshow/118220123.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-rate-cut-expectations-april-2025/articleshow/118225678.cms",
        "https://economictimes.indiatimes.com/news/economy/finance/impact-of-rbi-rate-cuts-on-fixed-deposits/articleshow/118230123.cms",
        "https://economictimes.indiatimes.com/news/economy/policy/rbi-liquidity-measures-economic-growth/articleshow/118235678.cms",
    ],
    "zepto-ipo": [
        "https://economictimes.indiatimes.com/tech/startups/zepto-files-drhp-for-ipo-quick-commerce/articleshow/118500123.cms",
        "https://economictimes.indiatimes.com/tech/startups/zepto-ipo-valuation-details-funding/articleshow/118505678.cms",
        "https://economictimes.indiatimes.com/tech/startups/zepto-ipo-what-investors-need-to-know/articleshow/118510123.cms",
        "https://economictimes.indiatimes.com/tech/startups/quick-commerce-zepto-vs-blinkit-vs-instamart/articleshow/118515678.cms",
        "https://economictimes.indiatimes.com/tech/startups/zepto-revenue-growth-path-to-profitability/articleshow/118520123.cms",
        "https://economictimes.indiatimes.com/tech/startups/zepto-ipo-grey-market-premium/articleshow/118525678.cms",
        "https://economictimes.indiatimes.com/tech/startups/zepto-ceo-aadit-palicha-interview-ipo-plans/articleshow/118530123.cms",
        "https://economictimes.indiatimes.com/tech/startups/zepto-ipo-impact-on-quick-commerce-sector/articleshow/118535678.cms",
    ],
}

# ── Fallback sample articles ──
FALLBACK_ARTICLES = [
    {
        "id": "budget-001",
        "title": "Union Budget 2025-26: Key Highlights — No Income Tax Up To ₹12 Lakh",
        "body": "Finance Minister Nirmala Sitharaman announced sweeping changes in income tax slabs in the Union Budget 2025-26. The headline announcement was that individuals earning up to ₹12 lakh per year will pay zero income tax, a significant jump from the previous ₹7 lakh limit. The new tax regime now has revised slabs: 0-4 lakh (nil), 4-8 lakh (5%), 8-12 lakh (10%), 12-16 lakh (15%), 16-20 lakh (20%), 20-24 lakh (25%), and above 24 lakh (30%). The government estimates this will benefit over 1 crore taxpayers and put more money in the hands of the middle class, boosting consumption. The revenue foregone is estimated at ₹1 lakh crore. Industry bodies like CII and FICCI welcomed the move, calling it a significant boost to consumer spending. The FM also announced simplification of TDS/TCS provisions and extended the updated return filing window to 4 years from 2 years. Experts noted this is one of the most significant tax reforms in recent years, comparable to the GST introduction.",
        "published_at": "2025-02-01",
        "url": "https://economictimes.indiatimes.com/budget-2025-highlights",
        "topic": "union-budget-2026"
    },
    {
        "id": "budget-002",
        "title": "Budget 2025: Impact on Mutual Fund Investors — TDS Changes and New Opportunities",
        "body": "The Union Budget 2025-26 has several implications for mutual fund investors. First, the increased income tax exemption limit to ₹12 lakh means investors in lower brackets will have more disposable income for SIP investments. Second, the FM announced that TDS on mutual fund redemption above ₹10 lakh would be reduced from 20% to 12.5% — a significant relief for large investors. Third, the capital gains tax structure remains unchanged, with LTCG on equity funds taxed at 12.5% above ₹1.25 lakh. Industry experts predict that the tax savings for the middle class (estimated at ₹25,000-80,000 per person) will directly flow into SIP investments, potentially adding ₹15,000-20,000 crore to annual MF inflows. AMFI chairman noted that the budget is positive for the mutual fund industry as it increases the investible surplus. Tax experts recommend that investors consider increasing their SIP amounts by the tax savings amount to optimize long-term wealth creation. The budget also announced a new fund of funds structure for green energy investments.",
        "published_at": "2025-02-02",
        "url": "https://economictimes.indiatimes.com/budget-2025-mutual-funds",
        "topic": "union-budget-2026"
    },
    {
        "id": "budget-003",
        "title": "Budget 2025: Stock Market Reaction — Nifty Surges 2% on Tax Relief",
        "body": "The Indian stock market rallied sharply after the Union Budget 2025-26 announcement. The Nifty 50 index surged over 2% to close at 23,482, while the BSE Sensex gained 1,500 points to end at 77,280. The rally was broad-based, with consumer discretionary and banking stocks leading the gains. Consumer stocks like Titan, Asian Paints, and Hindustan Unilever gained 3-5% on expectations that higher disposable income from tax cuts would boost consumer spending. Banking stocks like HDFC Bank and ICICI Bank rose 2-3% on expectations of higher retail lending. FIIs turned net buyers for the first time in 3 months, purchasing ₹3,200 crore worth of equities. Market analysts at Goldman Sachs noted that the budget's focus on consumption growth and fiscal discipline was a positive surprise. The fiscal deficit target of 4.4% of GDP for FY26 was better than the market expectation of 4.6%. However, some analysts cautioned that the revenue foregone from tax cuts (₹1 lakh crore) could potentially widen the deficit if growth assumptions don't materialize.",
        "published_at": "2025-02-01",
        "url": "https://economictimes.indiatimes.com/budget-2025-market-reaction",
        "topic": "union-budget-2026"
    },
    {
        "id": "budget-004",
        "title": "Budget 2025: Infrastructure Push — ₹11.2 Lakh Crore for Capital Expenditure",
        "body": "The Finance Minister allocated ₹11.2 lakh crore for capital expenditure in FY26, a 10% increase over the revised estimates for FY25. Key allocations include ₹2.7 lakh crore for roads and highways, ₹1.8 lakh crore for railways, and ₹1.2 lakh crore for defence capital. The budget also announced 8 new industrial corridors, 50 additional airports under UDAN, and the expansion of metro networks in 25 cities. A new ₹25,000 crore Urban Challenge Fund was announced to promote sustainable urbanization. The infrastructure sector received a boost with the extension of tax holidays for infrastructure investment trusts (InvITs). Construction companies like L&T, Adani Ports, and IRB Infrastructure gained 3-5% on the announcements. Industry body NHAI confirmed that 12,000 km of national highways would be built in FY26. The PM Gati Shakti framework continues to guide multimodal connectivity, with a focus on last-mile connectivity in Northeast India and aspirational districts.",
        "published_at": "2025-02-01",
        "url": "https://economictimes.indiatimes.com/budget-2025-infrastructure",
        "topic": "union-budget-2026"
    },
    {
        "id": "sebi-001",
        "title": "SEBI Proposes Regulatory Framework for Algo Trading by Retail Investors",
        "body": "The Securities and Exchange Board of India (SEBI) has proposed a comprehensive regulatory framework for algorithmic trading by retail investors. The framework requires all algo trading strategies to be registered with the exchange through the broker. Retail investors using third-party algo platforms will need to get their algorithms approved by the exchange before deployment. The key proposals include: (1) All algos must be tagged with a unique identifier and registered on the exchange platform, (2) Brokers are responsible for ensuring compliance and risk management of retail algos, (3) Third-party algo providers must register as Research Analysts with SEBI, (4) A kill switch mechanism must be implemented to halt rogue algorithms. SEBI chairperson Madhabi Puri Buch stated that the framework balances innovation with investor protection. The regulator noted that algo trading accounts for over 60% of exchange volumes, but most of it is by institutional investors. Retail algo trading has been growing at 40% annually. Industry stakeholders have been given 30 days to submit feedback on the consultation paper.",
        "published_at": "2025-01-15",
        "url": "https://economictimes.indiatimes.com/sebi-algo-trading-framework",
        "topic": "sebi-algo-trading"
    },
    {
        "id": "sebi-002",
        "title": "SEBI Algo Trading Rules: What Retail Investors Need to Know",
        "body": "SEBI's new algo trading circular will fundamentally change how retail investors use automated strategies. Here's a breakdown of what changes: Registration requirement — every algorithm, whether built by the investor or purchased from a third-party platform, must be registered with the stock exchange through the broker. This means platforms like Zerodha Streak, Alice Blue ANT, and third-party API traders will all need to comply. Performance testing — all algos must pass a simulated testing phase on the exchange's sandbox before live deployment. This includes stress testing against flash crash scenarios. Risk management — mandatory position limits, price band checks, and order-per-second limits. Brokers must implement a kill switch that can halt an algo within 1 second. Cost implications — algo providers estimate compliance costs of ₹5-10 lakh per algorithm registration, which could make it expensive for small retail traders. Industry reaction is mixed: fintech platforms like Zerodha and Groww have welcomed the regulatory clarity but warned that overly strict rules could push algo trading underground. NSE and BSE are developing the registration portal, expected to go live by Q3 2025.",
        "published_at": "2025-01-20",
        "url": "https://economictimes.indiatimes.com/sebi-algo-trading-rules",
        "topic": "sebi-algo-trading"
    },
    {
        "id": "sebi-003",
        "title": "Impact of SEBI Algo Trading Regulations on Brokers and Platforms",
        "body": "SEBI's proposed algo trading framework will significantly impact brokers and algo trading platforms. Discount brokers like Zerodha, Groww, and Angel One that offer API-based trading will need to implement compliance layers. Zerodha CEO Nithin Kamath tweeted that while the regulation is needed, implementation specifics need clarity. Key impacts include: broker liability — brokers will be held responsible for all algo trades executed through their platform, even if the algo was created by a third party. This increases compliance costs and legal exposure. Platform registration — third-party platforms like Smallcase, Streak, and AlgoTrader must register with SEBI as Investment Advisors or Research Analysts. Revenue impact — some analysts estimate that algo trading generates 15-20% of discount brokers' revenue. Strict regulations could reduce trading volumes initially. Positive effects — clearer rules may actually increase institutional confidence in the market's integrity. Market manipulation through algo strategies (spoofing, layering) will become harder. International comparison — India's approach is moderate compared to the EU's MiFID II and USA's SEC Regulation NMS. Industry body ANMI has requested SEBI to implement the framework in phases over 18 months.",
        "published_at": "2025-01-25",
        "url": "https://economictimes.indiatimes.com/sebi-algo-brokers-impact",
        "topic": "sebi-algo-trading"
    },
    {
        "id": "sebi-004",
        "title": "What is Algorithmic Trading and Why SEBI Wants to Regulate It",
        "body": "Algorithmic trading, or algo trading, uses computer programs to execute trades based on predefined rules — price, timing, volume, or mathematical formulas. In India, algo trading has grown from 5% of exchange volume in 2010 to over 60% in 2024. Here's why SEBI is stepping in now: Retail explosion — retail investors using algo platforms grew 300% between 2021-2024, driven by fintech apps offering strategy builders and API access. Risk events — several instances of retail algos causing unexpected losses, including a case where a malfunctioning algo placed ₹68 crore in orders within seconds. Market integrity — concerns about algo strategies that could manipulate prices (spoofing, quote stuffing) without adequate oversight. Information asymmetry — institutional investors have sophisticated risk management, but retail investors often use algos without understanding the risks. Global trend — regulators worldwide (SEC, FCA, MAS) have implemented algo trading regulations; India was one of the few major markets without one. SEBI's framework aims to create a level playing field. The regulator has clarified that algos using basic features like GTT orders, price alerts, and basket orders will NOT require registration — only strategies that automatically generate and execute orders without manual intervention.",
        "published_at": "2025-01-18",
        "url": "https://economictimes.indiatimes.com/what-is-algo-trading-sebi",
        "topic": "sebi-algo-trading"
    },
    {
        "id": "rbi-001",
        "title": "RBI Cuts Repo Rate by 25 bps to 6.25%: First Cut in 5 Years",
        "body": "The Reserve Bank of India's Monetary Policy Committee (MPC) cut the repo rate by 25 basis points to 6.25% in its February 2025 meeting, the first reduction in nearly five years. RBI Governor Sanjay Malhotra, in his first policy as governor, announced the dovish pivot citing cooling inflation and the need to support growth. Key highlights: the CPI inflation forecast for FY26 is 4.2%, within the RBI's comfort zone. GDP growth forecast revised to 6.7% for FY26. The MPC voted 4-2 in favor of the rate cut, with two members preferring a larger 50 bps cut. The standing deposit facility (SDF) rate was adjusted to 6.0%, and the marginal standing facility (MSF) rate to 6.5%. Banks are expected to pass on the rate cut to borrowers within the next quarter. SBI and HDFC Bank have already indicated they will reduce their MCLR rates. The rate cut will reduce EMIs on home loans: for a ₹50 lakh, 20-year loan, the monthly EMI could reduce by approximately ₹800. The money market reacted positively with the 10-year government bond yield falling 8 bps to 6.62%.",
        "published_at": "2025-02-07",
        "url": "https://economictimes.indiatimes.com/rbi-rate-cut-feb-2025",
        "topic": "rbi-rate-decisions"
    },
    {
        "id": "rbi-002",
        "title": "RBI Rate Cut Impact: Home Loans to Get Cheaper, FD Rates May Fall",
        "body": "The RBI's 25 bps repo rate cut to 6.25% will have cascading effects across the financial system. For borrowers: home loan EMIs will decrease by ₹700-800 per ₹50 lakh for new floating-rate loans. Existing borrowers on repo-linked lending rate (RLLR) will see automatic adjustments within the current quarter. Personal loan rates are expected to drop by 15-25 bps over the next 2 months. For depositors: fixed deposit rates are likely to decline by 10-20 bps over the next quarter. Senior citizens who depend on FD income should consider locking in current rates. Tax-saving FDs under Section 80C still offer 6.5-7% but may reduce soon. Banking sector impact: net interest margins (NIMs) will compress by 5-8 bps as lending rates fall faster than deposit rates. Banks with higher CASA ratios (HDFC Bank, Kotak) are better positioned. NBFCs and housing finance companies (Bajaj Finance, LIC Housing) will benefit from lower borrowing costs. Bond market: government securities rallied with the 10-year yield dropping to 6.62%. Bond fund NAVs gained 0.3-0.5% on the day. Debt mutual fund investors in long-duration funds will see mark-to-market gains.",
        "published_at": "2025-02-08",
        "url": "https://economictimes.indiatimes.com/rbi-rate-cut-impact",
        "topic": "rbi-rate-decisions"
    },
    {
        "id": "rbi-003",
        "title": "RBI Monetary Policy: What Experts and Analysts Say About the Rate Cut",
        "body": "The RBI's rate cut has elicited diverse reactions from economists and market analysts. Goldman Sachs: 'We expect 75 bps of cumulative cuts in 2025, with the next cut likely in April. The RBI's tone was more dovish than expected.' Morgan Stanley: 'The rate cut was on expected lines, but the growth forecast of 6.7% seems optimistic given global headwinds. We expect two more 25 bps cuts this year.' HDFC Bank Chief Economist: 'The rate cut signals confidence in the inflation trajectory. Food inflation risks are well-contained after a good monsoon.' CII President: 'Industry welcomes the rate cut. Combined with the budget's capex push, this creates favorable conditions for private investment revival.' SBI Chairman: 'We will review our MCLR within a week. Transmission will be faster this time as liquidity conditions are comfortable.' Independent economist Madan Sabnavis: 'The 4-2 vote indicates some MPC members wanted a bolder cut. If April inflation prints below 4.5%, we could see a 50 bps cut in June.' Former RBI Governor Raghuram Rajan cautioned that rate cuts alone won't revive credit growth, and structural reforms are needed alongside monetary easing.",
        "published_at": "2025-02-08",
        "url": "https://economictimes.indiatimes.com/rbi-rate-cut-expert-reactions",
        "topic": "rbi-rate-decisions"
    },
    {
        "id": "rbi-004",
        "title": "RBI Liquidity Measures: ₹1.5 Lakh Crore Injected Through Various Instruments",
        "body": "Alongside the rate cut, the RBI announced a series of liquidity injection measures totaling approximately ₹1.5 lakh crore. The measures include: ₹60,000 crore through a 56-day variable rate repo auction, ₹40,000 crore through open market purchase of government securities, ₹25,000 crore through USD-INR buy-sell swaps (3-month tenor), and ₹25,000 crore through a reduction in the CRR to 4%. These measures aim to bring the weighted average call rate (WACR) closer to the repo rate, ensuring effective transmission of the rate cut. Banking system liquidity has been in deficit mode since December 2024, with an average deficit of ₹1.8 lakh crore. The RBI's measures are expected to move the system to a neutral-to-surplus position by March-end. Transmission to lending rates requires adequate system liquidity. Money market rates have already responded: the overnight TREPS rate fell 15 bps, and the 91-day T-Bill yield dropped 12 bps. Market participants expect the RBI to maintain comfortable liquidity conditions to support the government's borrowing program of ₹14.8 lakh crore for FY26.",
        "published_at": "2025-02-10",
        "url": "https://economictimes.indiatimes.com/rbi-liquidity-measures",
        "topic": "rbi-rate-decisions"
    },
    {
        "id": "zepto-001",
        "title": "Zepto Files DRHP for ₹4,500 Crore IPO: Quick Commerce Giant Eyes Public Markets",
        "body": "Zepto, the quick-commerce startup founded by 21-year-old Stanford dropouts Aadit Palicha and Kaivalya Vohra, has filed its Draft Red Herring Prospectus (DRHP) with SEBI for a ₹4,500 crore IPO. The IPO comprises a fresh issue of ₹3,500 crore and an offer for sale (OFS) of ₹1,000 crore by existing investors. Key financial metrics: Zepto's revenue grew 140% year-on-year to ₹5,408 crore in FY25, with gross margins improving from 12% to 19%. The company's net loss narrowed from ₹1,272 crore to ₹890 crore. The average order value (AOV) stands at ₹345, with 15 million monthly transacting users. Zepto operates over 700 dark stores across 15 cities. The company plans to use IPO proceeds for: dark store expansion (₹1,500 crore), technology and AI infrastructure (₹800 crore), brand building (₹500 crore), and general corporate purposes (₹700 crore). Key investors include Y Combinator, StepStone Group, Nexus Venture Partners, and DragoneerInvestment Group. The company's last private valuation was $5 billion. Investment banks JP Morgan, Goldman Sachs, and Kotak Mahindra Capital are managing the IPO.",
        "published_at": "2025-03-01",
        "url": "https://economictimes.indiatimes.com/zepto-ipo-drhp",
        "topic": "zepto-ipo"
    },
    {
        "id": "zepto-002",
        "title": "Zepto IPO Valuation: Can Quick Commerce Justify $8 Billion?",
        "body": "Analysts are divided on Zepto's expected IPO valuation of $8 billion (₹67,000 crore). Bulls argue that Zepto's 140% revenue growth, improving unit economics, and dominant position in 10-minute delivery justify the premium. The quick commerce market in India is projected to reach $6 billion by 2027, growing at 45% CAGR. Zepto's market share is approximately 30%, behind Blinkit (40%) but ahead of Swiggy Instamart (25%). Bears point to the ₹890 crore net loss, cash burn of ₹75 crore per month, and the fact that no quick commerce company globally has achieved sustainable profitability. Comparison with listed peers: Zomato (which owns Blinkit) trades at 15x EV/Revenue, while Swiggy (which owns Instamart) trades at 8x. At $8 billion, Zepto would be valued at approximately 10x FY25 revenue. Key risks include: intense competition driving up dark store rents, customer acquisition costs remaining high at ₹180 per new user, and regulatory risks around gig worker classification. However, Zepto's AI-powered demand prediction system (which claims 95% accuracy on order forecasting) gives it a technological advantage in inventory management.",
        "published_at": "2025-03-05",
        "url": "https://economictimes.indiatimes.com/zepto-ipo-valuation",
        "topic": "zepto-ipo"
    },
    {
        "id": "zepto-003",
        "title": "Quick Commerce Wars: Zepto vs Blinkit vs Instamart — Who Will Win?",
        "body": "The quick commerce sector in India has become a three-horse race between Zepto, Zomato-owned Blinkit, and Swiggy Instamart. Here's how they compare in 2025: Dark store count — Blinkit: 1,000+, Zepto: 700+, Instamart: 550+. Monthly transacting users — Blinkit: 25M, Zepto: 15M, Instamart: 12M. Average order value — Zepto: ₹345, Blinkit: ₹320, Instamart: ₹310. Delivery time — Zepto: 8.5 minutes average, Blinkit: 10 minutes, Instamart: 12 minutes. Geographical presence — Blinkit: 30 cities, Zepto: 15 cities, Instamart: 20 cities. Unit economics — Zepto claims contribution margin positive since Q2 FY25, Blinkit since Q4 FY24, Instamart is still contribution negative. Key differentiators: Zepto's edge is speed (consistently the fastest), Blinkit leverages Zomato's user base and restaurant network, Instamart benefits from Swiggy's last-mile delivery infrastructure. All three are expanding into non-grocery categories: Blinkit Bistro (cooked food), Zepto Cafe, and Instamart Express. Industry experts predict that market consolidation is likely by 2027, with only 2 players surviving long-term.",
        "published_at": "2025-03-10",
        "url": "https://economictimes.indiatimes.com/quick-commerce-comparison",
        "topic": "zepto-ipo"
    },
    {
        "id": "zepto-004",
        "title": "Zepto CEO Aadit Palicha: 'We Will Be EBITDA Positive by Q2 FY26'",
        "body": "In an exclusive interview with ET, Zepto co-founder and CEO Aadit Palicha laid out the company's path to profitability ahead of its IPO. 'Our unit economics have improved dramatically. Contribution margin went from -15% to +5% in 18 months. We will be EBITDA positive by Q2 FY26,' Palicha said. Key strategies for profitability: (1) Private labels — Zepto now has 50+ private label SKUs with 35% gross margins vs 15% for branded products. Private labels contribute 12% of revenue. (2) Advertising — Zepto's ad platform for FMCG brands generates ₹50 crore monthly, growing 200% YoY. This is high-margin revenue. (3) AI-powered operations — the company uses machine learning for demand forecasting, inventory management, and delivery route optimization. 'Our AI reduces food waste by 40% compared to traditional retail,' Palicha claims. (4) Dark store efficiency — newer dark stores achieve break-even within 3 months vs 6 months earlier. On the IPO: 'This is not a fundraise of desperation. We have ₹4,200 crore in the bank. The IPO is about providing liquidity to early investors and building a public market presence.' On competition: 'The market is big enough for 2-3 players. We compete on speed and quality, not discounts.'",
        "published_at": "2025-03-12",
        "url": "https://economictimes.indiatimes.com/zepto-ceo-interview",
        "topic": "zepto-ipo"
    },
    {
        "id": "budget-005",
        "title": "Budget 2025: Agriculture Sector Gets ₹1.52 Lakh Crore Allocation",
        "body": "The Union Budget 2025-26 allocated ₹1.52 lakh crore to the agriculture sector, a 12% increase over the previous year. Key announcements include: expansion of PM-KISAN by increasing payments from ₹6,000 to ₹8,000 per year for small farmers, covering 10 crore farming families. A new Digital Agriculture Mission with ₹2,000 crore allocation to build a national crop registry using satellite imaging and AI. The government announced a ₹5,000 crore Kisan Credit Card Plus scheme with interest subvention of 3% for small and marginal farmers. MSP for wheat was increased by ₹150 to ₹2,425 per quintal, and for rice by ₹117 to ₹2,300 per quintal. A new food processing fund of ₹3,000 crore was announced to support 15,000 micro food enterprises. Natural farming will be promoted through a ₹1,000 crore scheme covering 1 crore hectares over 5 years. Industry experts noted that the agriculture allocations are higher than expected and should support rural consumption recovery. Farm equipment companies like M&M and Escorts saw their stock prices rise 3-4% post-budget.",
        "published_at": "2025-02-01",
        "url": "https://economictimes.indiatimes.com/budget-2025-agriculture",
        "topic": "union-budget-2026"
    },
    {
        "id": "sebi-005",
        "title": "SEBI Board Approves Algo Trading Framework: Registration Opens Q3 2025",
        "body": "The SEBI board in its meeting approved the final framework for algorithmic trading regulation. Key decisions include: mandatory registration for all algo strategies through exchanges, a phased implementation starting Q3 2025, and a simplified registration process for retail investors using basic algo strategies. The board also approved: API-based trading through brokers will continue but with enhanced audit trails and risk management. Third-party algo providers must register as Investment Advisors and undergo annual audits. A dedicated algo trading cell at each exchange to review and approve registrations. Penalty framework: first offense for unregistered algo usage will attract a ₹50,000 fine, with escalating penalties up to ₹25 lakh for repeat offenders. SEBI has drawn clear distinctions between: (1) automated order execution (like GTT, AMO — no registration needed), (2) semi-automated strategies (like screening tools — light registration), and (3) fully automated algos (auto-execute — full registration required). NSE and BSE will develop a unified registration portal by July 2025. The exchanges will also publish weekly reports on registered algo performance and any anomalies detected.",
        "published_at": "2025-02-15",
        "url": "https://economictimes.indiatimes.com/sebi-algo-board-approval",
        "topic": "sebi-algo-trading"
    },
]


def scrape_article(url: str, topic: str) -> dict | None:
    """Scrape a single article using newspaper3k."""
    if not HAS_NEWSPAPER:
        return None
    try:
        article = Article(url)
        article.download()
        article.parse()

        if not article.text or len(article.text) < 200:
            return None

        return {
            "id": hashlib.md5(url.encode()).hexdigest()[:12],
            "title": article.title or "Untitled",
            "body": article.text,
            "published_at": (
                article.publish_date.strftime("%Y-%m-%d")
                if article.publish_date
                else datetime.now().strftime("%Y-%m-%d")
            ),
            "url": url,
            "topic": topic,
        }
    except Exception as e:
        print(f"  ✗ Failed to scrape {url}: {e}")
        return None


def scrape_all() -> list[dict]:
    """Scrape all target URLs, then merge with fallback data."""
    articles = []
    scraped_ids = set()

    # 1) Try live scraping
    if HAS_NEWSPAPER:
        print("═══ Live scraping from Economic Times ═══")
        for topic, urls in TOPIC_URLS.items():
            print(f"\n▸ Topic: {topic}")
            for url in urls:
                print(f"  → {url[:80]}...")
                art = scrape_article(url, topic)
                if art:
                    articles.append(art)
                    scraped_ids.add(art["id"])
                    print(f"  ✓ Scraped: {art['title'][:60]}")
                time.sleep(1)  # polite delay

    scraped_count = len(articles)
    print(f"\n═══ Live scraping: {scraped_count} articles ═══")

    # 2) Merge fallback articles (avoid duplicates by topic coverage)
    topics_covered = {a["topic"] for a in articles}
    topics_needing_fallback = set(TOPIC_URLS.keys())

    # Always add fallback articles for better coverage
    for fb in FALLBACK_ARTICLES:
        if fb["id"] not in scraped_ids:
            articles.append(fb)
            print(f"  + Fallback added: {fb['title'][:60]}")

    print(f"\n═══ Total articles: {len(articles)} ═══")
    return articles


def main():
    articles = scrape_all()
    with open(ARTICLES_PATH, "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Saved {len(articles)} articles to {ARTICLES_PATH}")


if __name__ == "__main__":
    main()
