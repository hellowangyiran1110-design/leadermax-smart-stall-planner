# Leader-Max Smart Stall Planner

**README body word count** — 1,099 words

Leader-Max is a web prototype for first-time market traders. It uses a crystal stall in Birmingham to explore two questions: which market fits the trader’s plans, and how does each sale affect the stall?

The current prototype covers market selection and a simulated trading session. Funding, equipment rental and team coordination appear in the early portfolio and are outside the scope of this web prototype.

## Choosing a market

Traders can compare ten candidate locations against their stall-fee budget, preferred distance and available time of day. Each location shows which criteria it meets. Traders can change a preference, see how the match changes and choose a location for their stall. Stall fees and trading times are examples.

## Running the stall

Traders can start a 60-second simulation and watch orders arrive, or add an example order themselves. Each order updates total revenue, the order count, the number of units sold and the remaining stock. Traders can pause the session to inspect the figures or reset it to try again.

## Run the prototype

From the project root, start a local server with Python 3:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/` in your browser. Use the links on the home page to navigate between screens. No API key or account is required. The map tiles, postcode lookup and walking routes require an internet connection.

## Try two interactions

1. **Check how a budget changes a match.** On the home page, select **Compare locations**. Open **Jewellery Quarter** and choose the **Match** tab. Set **Maximum stall fee (£)** to **50**, then change it to **20**. The example fee stays at **£45**, but the budget result changes from *within limit* to *above limit*. The distance and time results stay the same.
2. **Follow one simulated sale.** Open **Stall dashboard** and select **Reset**. Select **Start trading**, then immediately select **Example order** and **Pause trading**. If you add the order before the first scheduled sale, revenue rises from **£120 to £135**, orders rise from **8 to 9**, and the remaining stock of the **Rose Quartz Bracelet** falls from **16 to 15**. Select **Reset** to repeat.

## Files

- `index.html`, `style.css`, `app.js`: Home page.
- `map/index.html`, `map/style.css`, `map/app.js`: location explorer.
- `menu/index.html`, `menu/style.css`, `menu/app.js`: nine-crystal interactive slider; `menu/products.json` keeps draft product stories and simulated sales for a later iteration; `menu/product-fallback.js` and `menu/background-fallback.js` are local, on-demand image fallbacks; `assets/menu/crystal-planters/` stores product imagery. Sales figures and product stories are examples.
- `shop.html`, `shop.css`, `shop.js`: stall dashboard with a 60-second simulated session, sale chimes, crystal glow, mood and progress; all figures are illustrative.
- `map/README.md`: data status, map services and source references.
- `luna-crystal-stall.png`, `vedio.mp4`: existing Home media.
- [System logic](docs/system-logic.md) — How market matches are calculated and how a simulated sale updates stock and revenue.
- [Project credits](CREDITS.md) — Sources for the Birmingham map, postcode lookup and walking routes, plus credits for the crystal collection artwork.

## Design portfolio for assessment

The early Leader-Max design portfolio is provided separately for assessment. Reviewers can consult `Leader-Max-Design-Portfolio.zip` alongside the Canvas report for the original field research, user journey and early design concepts. The web prototype can be run and reviewed using the files in this repository alone.

## Prototype features and data

| Feature | How it works | Data used |
|---|---|---|
| Market matching | The map checks each venue against the trader’s budget, maximum straight-line distance and preferred time of day. The Match tab shows which criteria each venue meets. | Venue locations are approximate. Stall fees, trading times and the footfall map use example data. Traders can follow the organiser link to check venue details. |
| Earnings scenarios | The Earnings tab shows the revenue for the selected hours and sales pace. For example, four hours at two orders per hour and £15 per order gives £120 before costs. | The slow, typical and busy scenarios assume one, two and three orders per hour respectively. Each uses a £15 average sale. |
| Home summary | Choosing a venue saves it in the browser. Home and Stall dashboard display the selected location. | Home shows preset figures for each venue. For example, Jewellery Quarter has a stall score of 84/100. The map calculates its own match count from the trader’s preferences. |
| Stall dashboard | Each simulated order updates revenue, units sold and stock. Pausing holds the figures on screen. Reset restores the starting values. | The session uses three sample products, simulated orders and a simulated visitor count. |
| Crystal collection | Traders can browse nine crystal gardens and view each product’s description and example sales count. | The collection has its own product list and sales figures. A dashboard order affects only the dashboard inventory. |

## Technology and external services

The prototype uses HTML, CSS and JavaScript. The browser applies the venue-matching rules and updates the simulated sales figures. Python 3 serves the project files during local use.

- **Map display.** MapLibre GL JS renders the Birmingham map using OpenFreeMap tiles based on OpenStreetMap data. The prototype adds its own candidate venue markers and simulated footfall layer.
- **Starting postcode.** Selecting **Set** sends the entered UK postcode to Postcodes.io. The browser uses the returned coordinates as the starting point for distance comparisons and saves the postcode and coordinates locally.
- **Walking route.** Selecting **Show walking route** sends the approximate start and destination coordinates to the Valhalla routing service. While routing is active, choosing another venue or setting a new starting postcode requests an updated route. The Match tab uses straight-line distance.
- **Saved state.** The browser saves the chosen venue so that Home and Stall dashboard can display it. Simulated orders last for the current dashboard session. Reloading the dashboard restores its starting figures.

`backup-original-home/` contains copies of the pre-integration Home HTML and JavaScript. The folder is excluded from Git so the backups remain local.

## Development record

- **From an early concept to a working map.** In the Birmingham web prototype, the Match tab shows which conditions a venue meets. In a browser check, lowering the budget from £50 to £20 changed the result for Jewellery Quarter’s £45 example fee from *within limit* to *above limit*. Its distance and time results stayed the same.
- **From a dashboard prompt to a trading session.** In the early home prototype, selecting **View dashboard** displayed a message about a planned page. The button now opens a 60-second trading simulation. In a browser check, adding the first £15 bracelet order raised revenue from £120 to £135 and reduced its stock from 16 to 15. The order count increased from eight to nine.

## Design decisions and AI assistance

I narrowed Leader-Max to two tasks for a first-time crystal trader in Birmingham. Before trading, the user compares markets by budget, distance and available trading times, reviews the reasons for each match, and chooses a location. During a simulated session, the user can follow a single order and see how it changes revenue, the order count and remaining stock.

ChatGPT generated the nine crystal garden illustrations and the cabinet background. The running prototype uses rule-based market matching.

For this README, I used Codex to check the prototype’s behaviour in the browser and help draft the English documentation. I reviewed the project scope and wording before publication.

