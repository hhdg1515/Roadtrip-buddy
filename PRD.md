# OpenSeason PRD

## 1. Product Overview

**Product name:** OpenSeason
**Working tagline:** Find the best California outdoor road trip based on what is actually good right now.

OpenSeason is a California-focused outdoor road trip planning app. It helps users decide where to go, what to do, and what backup plan to use based on seasonality, weather, public land alerts, driving distance, terrain, activity type, and group preferences.

The first version focuses on California road trips, especially trips from Bay Area, Los Angeles, San Diego, and Sacramento to national parks, national forests, coastal towns, ski areas, desert regions, and scenic routes.

This is not a generic travel planning app. It is a seasonal outdoor decision engine.

---

## 2. Problem

Planning outdoor trips in California is inefficient because users must search across many fragmented sources:

* YouTube videos
* Xiaohongshu posts
* Google Maps reviews
* AllTrails comments
* National Park Service alerts
* Weather sites
* Snow reports
* Campground and lodging sites
* Blog posts, many of which are outdated

The information is often contradictory, stale, incomplete, or too generic.

Typical user questions are not simply “What is there to do in Yosemite?” They are more contextual:

* Is Yosemite actually worth visiting this weekend?
* Is Death Valley better than Joshua Tree in February?
* Where should I go from Bay Area for Labor Day if I only have 3 days?
* Is this a good weekend for wildflowers?
* Can I bring non-hikers and still make the trip worthwhile?
* If the trail is snowy, crowded, closed, or too hard, what is Plan B?
* Which region is in season right now?

Existing apps answer fragments of this problem. OpenSeason answers the decision.

---

## 3. Target Users

### Primary User

California-based outdoor road trip planner.

Usually lives in:

* Bay Area
* Los Angeles
* San Diego
* Sacramento

Common behaviors:

* Takes weekend or long-weekend trips
* Likes national parks, forests, mountains, coast, desert, skiing, hiking, scenic drives
* Searches heavily before traveling
* Compares multiple destinations before committing
* Needs current-condition judgment, not just generic recommendations

### Secondary User

Group trip organizer.

Pain points:

* Different group members want different activity intensity
* Some people hike or ski, others prefer cafes, bars, scenic stops, towns, spas, or easy walks
* Needs one plan that satisfies both active and non-active travelers

---

## 4. Product Thesis

The strongest wedge is not “AI travel itinerary.” That is too generic.

The wedge is:

**California seasonal outdoor intelligence.**

OpenSeason should help users answer:

> Given where I am starting from, how much time I have, who I am traveling with, and what season it is, what California road trip is actually good right now?

---

## 5. MVP Scope

### Geographic Scope

MVP focuses only on California.

Priority regions:

1. Yosemite
2. Tahoe
3. Mammoth / Eastern Sierra
4. Big Sur / Carmel / Highway 1
5. Death Valley
6. Joshua Tree / Palm Springs
7. Sequoia & Kings Canyon
8. Channel Islands
9. Lassen / Shasta
10. Carrizo Plain / Antelope Valley / wildflower regions

Future expansion:

* Nevada
* Oregon
* Arizona / Utah road trip extensions

Do not build nationwide coverage in V1.

---

## 6. Core Use Cases

### Use Case 1: “Where should I go this weekend?”

User enters:

* Starting city
* Dates or trip length
* Driving tolerance
* Preferred activities
* Group type

App returns:

* Top 3 recommended destinations
* Why each is good now
* What to avoid
* Plan A / Plan B

### Use Case 2: “Is this destination good right now?”

User enters a destination, such as Yosemite, Tahoe, Death Valley, Big Sur, or Mammoth.

App returns:

* Current activity fit
* Weather summary
* Seasonal fit
* Alerts and closures
* Best things to do now
* Things to avoid
* Nearby food/cafe/rest stops
* Lodging area suggestions

### Use Case 3: “Plan a trip for mixed activity levels”

User says:

* Some people want hiking/skiing
* Some people want cafes, bars, towns, scenic spots, or easy walks

App returns:

* Split-day itinerary
* Active route
* Low-effort companion route
* Shared meal or sunset point
* Fallback option

### Use Case 4: “Seasonal discovery”

App proactively shows:

* Best wildflower regions this month
* Best desert trips this month
* Best waterfall trips this month
* Best ski/snow trips this month
* Best coastal drives this month
* Best fall color trips this month

---

## 7. Core Features

## 7.1 Home: “What’s Good Now”

The home screen shows a California map and ranked seasonal recommendations.

Example cards:

* Best for wildflowers: Carrizo Plain
* Best for desert: Death Valley
* Best for ski weekend: Mammoth
* Best for easy coastal trip: Carmel + Big Sur
* Best for waterfalls: Yosemite Valley
* Avoid this weekend: high-elevation Sierra trails due to snow or closure risk

Each card includes:

* Fit score
* Why now
* Best activity
* Drive time from selected origin
* Risk warning
* One-tap trip plan

---

## 7.2 Destination Detail Page

Each destination page includes:

### Current Fit Summary

* Overall fit score
* Best current activity
* Seasonal window
* Weather risk
* Closure / alert risk
* Crowd risk if available or inferred

### Activity Recommendations

* Hiking
* Scenic driving
* Skiing / snowboarding
* Snowshoeing
* Wildflowers
* Fall colors
* Beach / coast
* Desert photography
* Family-friendly easy stops
* Non-athletic companion options

### Suggested Stops

* Overlooks
* Short walks
* Trailheads
* Visitor centers
* Scenic drives
* Cafes / bars / restaurants
* Nearby towns

### Lodging Guidance

V1 should not promise real-time hotel availability.

Instead, it should provide:

* Best town/area to stay
* Distance to main activities
* Lodging style notes
* Budget/mid/high-level area guidance
* Links out to booking platforms or official sites

### Plan B

Every destination should have a backup plan.

Examples:

* If Yosemite high-country roads are closed, suggest Yosemite Valley waterfalls or Mariposa Grove.
* If Tahoe ski conditions are poor, suggest lake viewpoints, Truckee cafes, snowshoe trails, or spa/town options.
* If Big Sur road sections are closed, suggest Carmel, Monterey, Point Lobos, or inland alternatives.

---

## 7.3 Trip Planner

Inputs:

* Origin city
* Dates or trip length
* Driving tolerance
* Activity preferences
* Group type
* Fitness level
* Budget preference
* Lodging style
* Need non-hiker/non-skier options: yes/no

Outputs:

* Recommended destination
* 2 alternative destinations
* Day-by-day itinerary
* Map route
* Key stops
* Food/cafe/bar suggestions
* Lodging area recommendation
* Current risks
* Plan B

---

## 7.4 AI Explanation Layer

The AI should explain recommendations in plain language.

Example:

> Death Valley is a strong pick for this weekend because temperatures are mild, most major viewpoints are accessible, and this is one of the best seasonal windows before summer heat makes the park harder to enjoy. Avoid long exposed hikes in the afternoon. Plan B is Joshua Tree + Palm Springs if lodging near Furnace Creek is too expensive.

The AI must not invent facts. It should cite or label the source type internally:

* Weather forecast
* Public land alert
* Seasonal heuristic
* Place data
* User preference

---

## 8. Features Explicitly Out of Scope for V1

Do not build these in MVP:

* Real-time hotel booking
* Real-time hotel inventory guarantees
* Full AllTrails replacement
* Scraping Xiaohongshu, YouTube, Google reviews, or AllTrails comments
* Nationwide coverage
* In-app social network
* User-generated trip community
* Full offline navigation
* Paid subscription system
* Multi-country support

These will slow the project down and create data/legal/API problems.

---

## 9. Data Sources

### V1 Recommended Data Sources

#### Public Land / Outdoor Data

* National Park Service API
* Recreation.gov / RIDB
* U.S. Forest Service recreation datasets
* National Weather Service API
* USGS elevation data
* NRCS snow/water data
* Avalanche.org or regional avalanche center links where relevant

#### Maps and Places

* Mapbox for maps/geocoding
* OpenStreetMap for base POI/trail/road references where appropriate
* Google Places for cafes, bars, restaurants, lodging areas, and reviews if budget permits

#### Internal Heuristic Data

OpenSeason should maintain its own seasonal intelligence table.

Example fields:

* destination_id
* best_months
* avoid_months
* activity_type
* elevation_range
* road_trip_style
* typical_risks
* family_friendliness
* non_athletic_options_score
* lodging_base_towns

---

## 10. Seasonality Engine

OpenSeason should score each region based on season and activity fit.

### Example Seasonal Rules

#### Death Valley

* Best: November–March
* Avoid: June–September for most casual users
* Activities: scenic drive, photography, short hikes, stargazing

#### Joshua Tree

* Best: October–April
* Avoid: peak summer heat
* Activities: bouldering, short hikes, desert photography, Palm Springs add-on

#### Yosemite

* Spring: waterfalls, valley hikes
* Summer: high country, Glacier Point, Tioga Road if open
* Fall: fewer crowds, cooler hikes
* Winter: valley, snowshoeing, scenic photography, road closure risk

#### Tahoe

* Winter: ski/snowboard/snowshoe
* Summer: lake, hiking, paddleboarding
* Fall: quieter lake and hiking trips
* Shoulder season: weather and snowmelt dependent

#### Eastern Sierra

* Summer: high alpine hiking
* Fall: foliage, photography, scenic drives
* Winter: Mammoth ski, hot springs, snow activities

#### Big Sur / Carmel / Highway 1

* Year-round, but road closure risk matters
* Best for scenic drive, coast, cafes, luxury lodging, easy group trips

#### Channel Islands

* Better in warmer months and calm weather windows
* Ferry availability and sea conditions matter

#### Carrizo Plain / Antelope Valley

* Spring wildflower-focused
* Highly dependent on rainfall and bloom reports

---

## 11. Scoring Model

Each destination gets a Trip Fit Score.

Suggested formula:

```
Trip Fit Score =
  Seasonality Score
+ Weather Score
+ Activity Match Score
+ Drive Time Score
+ Alert / Closure Score
+ Group Fit Score
+ Lodging Area Practicality Score
+ Plan B Quality Score
```

### Score Components

#### Seasonality Score

How appropriate the destination is for the selected month and activity.

#### Weather Score

Forecast suitability for planned activities.

#### Activity Match Score

How well the region supports selected interests.

#### Drive Time Score

Penalty if drive time exceeds user tolerance.

#### Alert / Closure Score

Penalty for park alerts, road closures, fire alerts, snow closures, or excessive heat.

#### Group Fit Score

Higher if both active and low-effort options exist.

#### Lodging Area Practicality Score

Higher if there are multiple reasonable base towns or lodging styles nearby.

#### Plan B Quality Score

Higher if the app can generate a credible alternative if conditions change.

---

## 12. Main Screens

### Screen 1: Home / What’s Good Now

* Current best destinations
* Seasonal category filters
* Starting city selector
* Weekend / 3-day / 5-day toggle

### Screen 2: Search / Ask

User can type:

* “Where should I go for Labor Day from Bay Area?”
* “Is Death Valley good in February?”
* “Plan a 3-day Tahoe trip with one skier and one non-skier.”

### Screen 3: Destination Detail

* Fit score
* Current conditions
* Best activities
* Alerts
* Recommended stops
* Food/cafe/bar suggestions
* Lodging area guidance
* Plan B

### Screen 4: Trip Plan

* Day-by-day itinerary
* Map route
* Stops
* Timing
* Risk notes
* Alternatives

### Screen 5: Saved Trips

* Saved plans
* Updated condition warnings
* Offline notes in later version

---

## 13. MVP User Flow

1. User opens app.
2. App asks for origin city or uses selected default.
3. User chooses trip length and interests.
4. App shows top recommended California destinations for the selected dates.
5. User taps a destination.
6. App shows why it is good now, what to do, what to avoid, and Plan B.
7. User generates a trip plan.
8. User saves or shares the plan.

---

## 14. Monetization Hypothesis

Do not start with monthly subscription.

This is a low-frequency, high-intent planning product. Most users plan around holidays, long weekends, summer, ski season, or specific trips.

Better monetization options:

### V1 Portfolio Version

No monetization required.

### Future Paid Options

#### Trip Pass

* One complete trip plan
* Dynamic updates for 7 days
* Price range: $3.99–$14.99

#### Seasonal Pass

* Summer hiking pass
* Fall foliage pass
* Ski season pass
* Desert winter pass
* Price range: $19–$49

#### Affiliate Revenue

Potential later-stage revenue:

* Hotels
* Campgrounds
* Gear rental
* Lift tickets
* Guided tours

Affiliate should not be the MVP dependency.

---

## 15. Success Metrics

### Product Metrics

* % of users who generate a trip plan after seeing recommendations
* % of users who save a plan
* % of users who ask for Plan B
* Average number of destinations compared per session
* Return usage before holidays or weekends

### Quality Metrics

* Recommendation usefulness rating
* “Would you take this trip?” rating
* “Did this save you research time?” rating
* User-reported mismatch rate

### Portfolio Metrics

This project should demonstrate:

* Product thinking
* AI system design
* API integration
* Geospatial reasoning
* Data ranking/scoring
* UX design for complex decision-making
* Practical constraint handling

---

## 16. Technical Architecture

### Frontend

Recommended:

* React Native with Expo
* Mapbox map view
* Card-based recommendation UI
* AI chat/search interface

Alternative:

* Next.js web app first, then mobile later

For Portfolio speed, web app may be faster. For real travel use, mobile is better.

### Backend

Recommended:

* FastAPI or Next.js API routes
* PostgreSQL + PostGIS for geospatial data
* Redis or simple cache layer for API responses
* Scheduled data refresh jobs

### AI Layer

* LLM used for summarization and itinerary generation
* Deterministic scoring engine used for ranking
* AI should not be the source of truth

### Data Storage

Core tables:

* destinations
* activities
* seasonal_rules
* places
* alerts
* weather_snapshots
* trip_plans
* user_preferences

---

## 17. Data Model Draft

### destinations

* id
* name
* region
* state
* latitude
* longitude
* destination_type
* description
* best_months
* avoid_months
* base_towns

### activities

* id
* destination_id
* activity_type
* name
* difficulty
* seasonality
* min_duration
* max_duration
* fitness_level
* family_friendly
* non_athletic_friendly

### seasonal_rules

* id
* destination_id
* month
* activity_type
* score
* explanation
* risk_notes

### alerts

* id
* destination_id
* source
* alert_type
* severity
* title
* description
* effective_date
* expiration_date

### weather_snapshots

* id
* destination_id
* date
* high_temp
* low_temp
* precipitation_probability
* wind_speed
* snow_risk
* heat_risk

### trip_plans

* id
* user_origin
* destination_id
* start_date
* end_date
* group_type
* preferences
* generated_plan
* plan_b

---

## 18. AI Prompting Strategy

The AI should receive structured context, not raw open-ended instructions.

### Input to AI

* User origin
* Dates
* Preferences
* Candidate destinations
* Fit scores
* Weather summary
* Alerts
* Seasonal notes
* Nearby places
* Lodging area guidance

### AI Output Format

* Recommendation summary
* Why this destination
* What to do
* What to avoid
* Day-by-day plan
* Plan B
* Notes for mixed groups
* Confidence level

### Guardrails

AI must not claim:

* Real-time hotel availability unless connected to a verified booking source
* Trail conditions unless from a verified source
* Road status unless from official or trusted source
* Exact crowd levels unless supported by data

Use language like:

* “Based on current forecast...”
* “Public alerts indicate...”
* “This is seasonally favorable because...”
* “Availability should be confirmed externally.”

---

## 19. MVP Build Plan

### Phase 1: Static Intelligence Prototype

Goal: Prove the product logic.

Build:

* 10–15 California destinations
* Manual seasonal rules
* Basic destination cards
* Basic trip fit score
* Mock weather data or one weather API integration
* AI-generated explanation

### Phase 2: Real API Integration

Add:

* NPS alerts
* Weather API
* Mapbox geocoding/map
* Google Places or OSM POI search
* Basic lodging area suggestions

### Phase 3: Trip Planner

Add:

* User input form
* Destination ranking
* Day-by-day itinerary
* Plan B generation
* Save/share plan

### Phase 4: Portfolio Polish

Add:

* Case study page
* Architecture diagram
* API source explanation
* Before/after user research story
* Design system screenshots
* Demo video

---

## 20. Portfolio Story

The Portfolio narrative should be:

> I built an AI-powered California outdoor road trip copilot that combines public land data, weather, seasonality rules, map data, and user preferences to recommend what is actually worth doing right now.

Show:

* Problem discovery
* Why generic travel planning fails
* Why California is the right scope
* API/data limitations
* Scoring model
* AI summarization layer
* UI flow
* Example trip: Bay Area to Yosemite vs Tahoe vs Big Sur
* Example mixed group: one skier, one non-skier in Tahoe
* Example seasonal window: Death Valley in winter vs summer

---

## 21. Key Product Principle

OpenSeason should not try to be the largest travel database.

It should be the clearest decision layer.

The user should leave with a decision:

* Go here
* Do this
* Avoid that
* Use this backup plan

That is the product value.

---

## 22. Open Questions

1. Should the first build be mobile-first or web-first?
2. Should the product start with “Where should I go?” or “Is this place good now?”
3. Should Google Places be included in V1 or replaced with OSM for cost control?
4. Should lodging be shown as areas/towns only, or include individual hotels?
5. Should wildflower and fall color recommendations be heuristic-only in V1?
6. Should users be able to compare 3 destinations side by side?
7. Should the app include user feedback after trips to improve future recommendations?

---

## 23. Recommended MVP Decision

Build the first version as a web app or Expo app with the following narrow demo flow:

**User scenario:**
Bay Area user wants a 3-day road trip next weekend with hiking, scenic views, good food stops, and one non-hiker in the group.

**App compares:**

* Yosemite
* Tahoe
* Big Sur / Carmel
* Death Valley
* Mammoth

**App outputs:**

* Best current pick
* Why
* What to do
* What to avoid
* Plan B
* Lodging area guidance
* Food/cafe/bar support options

This is enough to prove the product.

Do not expand scope until this flow feels clearly better than manually searching Google, YouTube, Xiaohongshu, Maps, and AllTrails.

---

# Core Screen Flow & Information Architecture

## 24. Information Architecture

OpenSeason should be organized around decisions, not content categories.

The app should not start from “parks,” “trails,” or “hotels.” It should start from user intent:

1. Where should I go?
2. Is this place good right now?
3. What should I do there?
4. What is the backup plan?

## 24.1 Primary Navigation

### Recommended Bottom Navigation

1. **Now**
2. **Explore**
3. **Plan**
4. **Saved**
5. **Profile**

### Why this nav works

* **Now** is the product wedge: what is good right now.
* **Explore** lets users browse California regions.
* **Plan** is where users generate a custom trip.
* **Saved** stores generated plans.
* **Profile** handles origin city, preferences, and API/account settings later.

Do not use generic nav labels like “Home,” “Search,” and “Discover” unless the UX makes their purpose obvious.

---

## 25. Top-Level App Structure

```
OpenSeason
├── Now
│   ├── What’s Good Now
│   ├── Seasonal Collections
│   ├── Regional Alerts
│   └── Weekend Picks
│
├── Explore
│   ├── Map View
│   ├── Destination List
│   ├── Region Pages
│   └── Destination Detail
│
├── Plan
│   ├── Trip Input
│   ├── Destination Comparison
│   ├── Generated Trip Plan
│   └── Plan B / Alternatives
│
├── Saved
│   ├── Saved Trips
│   ├── Saved Destinations
│   └── Shared Plans
│
└── Profile
    ├── Origin City
    ├── Activity Preferences
    ├── Driving Tolerance
    ├── Group Defaults
    └── Data / App Settings
```

---

## 26. Core Screen Flow

## Flow A: “What’s good now?”

This is the default first-time and returning-user flow.

```
Open App
  ↓
Now Screen
  ↓
Select origin city / use default
  ↓
Choose trip length: Weekend / 3 days / 5 days / 7 days
  ↓
View ranked destination cards
  ↓
Tap destination
  ↓
Destination Detail
  ↓
Generate Trip Plan
  ↓
Trip Plan Screen
  ↓
Save / Share / Compare Alternative
```

### User Goal

The user does not know where to go yet. They want the app to make a recommendation.

### Product Goal

Show that OpenSeason is better than manual research because it ranks destinations based on current conditions and user constraints.

---

## Flow B: “Is this destination good right now?”

```
Open App
  ↓
Search or Explore
  ↓
Enter destination: Yosemite / Tahoe / Big Sur / Death Valley
  ↓
Destination Detail
  ↓
Current Fit Summary
  ↓
Best Activities Now
  ↓
Warnings / Avoid
  ↓
Plan A + Plan B
```

### User Goal

The user already has a place in mind but is unsure whether it is the right choice.

### Product Goal

Prevent bad trips caused by stale assumptions, closures, weather, snow, heat, or poor seasonal timing.

---

## Flow C: “Plan a trip for a mixed group”

```
Open App
  ↓
Plan Tab
  ↓
Trip Input Form
  ↓
Select mixed group option
  ↓
Enter active interests + low-effort interests
  ↓
Generate Comparison
  ↓
Pick destination
  ↓
Split Itinerary Screen
  ↓
Shared meal / sunset / lodging base recommendation
```

### User Goal

The planner needs one trip that works for people with different energy levels.

### Product Goal

Turn a messy social planning problem into a structured itinerary.

---

## Flow D: “Seasonal discovery”

```
Open App
  ↓
Now Screen
  ↓
Tap collection: Wildflowers / Desert / Ski / Coast / Fall Colors
  ↓
Collection Page
  ↓
Ranked destinations
  ↓
Destination Detail
  ↓
Generate Trip Plan
```

### User Goal

The user wants inspiration tied to a season or activity.

### Product Goal

Make OpenSeason feel timely and alive.

---

# Screen Specifications

## 27. Screen 1: Onboarding

### Purpose

Capture the minimum preferences needed to make recommendations useful.

### Required Inputs

* Origin city
* Typical driving tolerance
* Favorite activity types
* Group default

### Optional Inputs

* Lodging style
* Fitness level
* Budget preference
* Has kids / pets / non-hikers

### Recommended Onboarding Questions

1. Where do you usually start from?

   * Bay Area
   * Los Angeles
   * San Diego
   * Sacramento
   * Other

2. How far are you willing to drive for a weekend trip?

   * 0–2 hours
   * 2–4 hours
   * 4–6 hours
   * 6–8 hours
   * 8+ hours

3. What do you usually want from a trip?

   * Hiking
   * Skiing / snow
   * Coast
   * Desert
   * Scenic drive
   * Food / cafe / towns
   * Photography
   * Camping
   * Luxury stay

4. Who do you usually travel with?

   * Solo
   * Couple
   * Friends
   * Family
   * Mixed group

### Important UX Decision

Do not over-onboard. Let users skip and use defaults.

---

## 28. Screen 2: Now

### Purpose

This is the main product surface.

It answers:

> What is worth doing in California right now?

### Main Modules

#### 1. Origin + Time Selector

Top section:

* Starting from: Bay Area / LA / SD / Sacramento
* Trip length: Weekend / 3 days / 5 days / 7 days
* Date selector

#### 2. Current Seasonal Banner

Example:

> Mid-April in California: wildflowers, waterfalls, desert windows, and early Sierra snowmelt are the main opportunities.

#### 3. Ranked Recommendation Cards

Each card should show:

* Destination name
* Region
* Fit score
* Best current activity
* Drive time from origin
* Why now
* Main warning
* CTA: View plan

Example card:

```
Carrizo Plain
Best for: Wildflowers + scenic drive
Fit: 91
Drive: 4h 20m from Bay Area
Why now: Spring bloom window, mild temperatures
Watch out: Remote services, limited food options
```

#### 4. Seasonal Collections

Horizontal cards:

* Wildflowers
* Waterfalls
* Desert
* Coast
* Ski / Snow
* Fall Colors
* Easy Family Trips
* Non-Hiker Friendly

#### 5. Avoid / Caution List

Small but useful module:

* Avoid Death Valley in peak summer heat
* Check Big Sur road closures
* High Sierra trails may still have snow
* Yosemite high country may not be open yet

### Empty State

If no strong recommendations are available:

> Conditions are mixed this week. Here are lower-risk options with good Plan B coverage.

---

## 29. Screen 3: Explore

### Purpose

Browse California destinations manually.

### Views

* Map view
* List view
* Region filter
* Activity filter
* Season filter

### Filters

* Region

  * Sierra Nevada
  * Central Coast
  * Southern Desert
  * Northern California
  * Bay Area escapes
  * Los Angeles escapes

* Activity

  * Hiking
  * Skiing
  * Scenic drive
  * Coast
  * Desert
  * Wildflowers
  * Fall colors
  * Camping
  * Food/town trip

* Trip style

  * Easy
  * Adventurous
  * Family-friendly
  * Romantic
  * Group trip
  * Non-hiker friendly

### Destination Card Fields

* Name
* Region
* Best months
* Current fit
* Drive time from selected origin
* Top activities
* Main seasonal warning

---

## 30. Screen 4: Destination Detail

### Purpose

Give a decision-quality answer for one destination.

### Above-the-Fold Content

#### 1. Destination Header

* Destination name
* Hero image or map snapshot
* Region
* Drive time
* Current fit score

#### 2. Current Verdict

A plain-language answer:

> Strong pick this weekend if you want waterfalls and valley hikes. Not ideal for high-elevation hiking yet.

#### 3. Score Breakdown

Show explainable scoring:

* Seasonality: 88
* Weather: 74
* Activity match: 91
* Closure risk: Medium
* Group fit: High
* Plan B quality: High

### Main Sections

#### Best Right Now

* Top 3 activities
* Best time of day
* Difficulty
* Why it fits now

#### What to Avoid

* Closures
* Heat
* Snow
* Crowds
* Long exposed hikes
* Weak lodging base

#### Suggested Stops

* Overlooks
* Short walks
* Scenic drives
* Visitor centers
* Trailheads
* Town stops

#### Food / Cafe / Bar Support

Especially important for mixed groups.

Show:

* Nearby town
* Cafe options
* Bar options
* Dinner area
* Low-effort hangout spots

#### Lodging Area Guidance

Do not overpromise availability.

Show:

* Best base town
* Alternative base town
* Stay style
* Distance tradeoff
* External booking CTA

Example:

```
Best base: Mammoth Lakes
Best for: skiing, restaurants, hot springs, non-skier options
Alternative: Bishop
Tradeoff: cheaper, farther from Mammoth Mountain
```

#### Plan B

Every destination must include at least one Plan B.

Plan B should include:

* Trigger condition
* Alternative activity
* Alternative place
* Why it works

Example:

```
If Tioga Road is closed:
Plan B: Focus on Yosemite Valley waterfalls, Tunnel View, Lower Yosemite Fall, and Mariposa Grove.
```

---

## 31. Screen 5: Plan Input

### Purpose

Collect enough trip constraints to generate a useful plan.

### Form Sections

#### Trip Basics

* Origin
* Dates
* Trip length
* Driving tolerance

#### Interests

* Hiking
* Skiing / snow
* Scenic drive
* Coast
* Desert
* Wildflowers
* Fall colors
* Food/towns
* Camping
* Photography

#### Group

* Solo
* Couple
* Friends
* Family
* Mixed energy levels
* Someone does not hike/ski

#### Intensity

* Very easy
* Moderate
* Hard
* Flexible

#### Lodging Style

* Camping
* Budget motel
* Cozy cabin
* Boutique hotel
* Luxury lodge
* Does not matter

### UX Rule

The form should feel like constraints, not a survey.

Recommended structure:

* Use chips and sliders
* Avoid long text fields
* Allow natural-language input as optional

Example natural-language box:

> “I want a 3-day trip from Bay Area with waterfalls, good food, and one person who does not hike.”

---

## 32. Screen 6: Destination Comparison

### Purpose

Let users compare options before committing.

### Layout

Three destination cards side by side or stacked.

Each card shows:

* Destination
* Fit score
* Best reason to go
* Biggest risk
* Drive time
* Best activity
* Group fit
* Plan B quality

Example:

```
1. Yosemite
Best for: waterfalls
Risk: high-country closures
Group fit: medium-high

2. Big Sur / Carmel
Best for: scenic coast + cafes
Risk: road closures
Group fit: very high

3. Tahoe
Best for: lake + snow shoulder season
Risk: mixed weather
Group fit: high
```

### CTA Options

* Build plan for this
* Compare details
* Save option

### Important UX Principle

The comparison should make tradeoffs obvious. Do not just show three pretty cards.

---

## 33. Screen 7: Generated Trip Plan

### Purpose

Give the user a practical itinerary.

### Sections

#### Trip Verdict

One paragraph:

* Why this plan fits
* Main risk
* Backup strategy

#### Day-by-Day Plan

Each day includes:

* Morning
* Midday
* Afternoon
* Evening
* Food/rest stops
* Drive notes
* Optional alternatives

#### Map Route

* Origin
* Stops
* Lodging base
* Return route

#### Conditions & Warnings

* Weather
* Alerts
* Road risk
* Heat/snow risk
* Reservation notes

#### Plan B

A complete alternative, not just a sentence.

#### Save / Share

* Save trip
* Export summary
* Share link

---

## 34. Screen 8: Split Group Plan

### Purpose

Handle the important edge case where not everyone wants the same activity.

### Example Scenario

One person skis, one person does not.

### Layout

#### Shared Base

* Recommended town
* Lodging area
* Shared breakfast/dinner plan

#### Active Track

* Ski / hike / long activity
* Timing
* Difficulty
* Gear notes

#### Low-Effort Track

* Cafe
* Scenic walk
* Spa
* Town exploration
* Visitor center
* Shopping / bookstore / bar

#### Rejoin Points

* Lunch option
* Sunset viewpoint
* Dinner area

### Why This Matters

This is a strong differentiator. Generic travel apps do not handle group mismatch well.

---

## 35. Screen 9: Saved

### Purpose

Keep plans accessible before and during travel.

### Sections

* Upcoming trips
* Saved destinations
* Past trips
* Shared plans

### Saved Trip Card

* Destination
* Dates
* Current alert status
* Last updated
* Plan B available

### Future Feature

Notify user if conditions materially change.

Examples:

* New park alert
* Snowstorm
* Heat advisory
* Road closure
* Fire/smoke warning

---

## 36. Screen 10: Profile / Preferences

### Purpose

Store defaults that improve ranking.

### Fields

* Default origin
* Driving tolerance
* Favorite activities
* Fitness level
* Lodging preference
* Group default
* Avoidances

  * Crowds
  * Snow driving
  * Extreme heat
  * Long hikes
  * Expensive lodging

### Important UX Principle

Preferences should improve recommendations but should not block browsing.

---

# Key UI Components

## 37. Destination Card

Required fields:

* Name
* Region
* Current fit score
* Best current activity
* Drive time
* Why now
* Main risk
* CTA

## 38. Fit Score Badge

Use labels, not just numbers.

Examples:

* Excellent now
* Good with caution
* Mixed conditions
* Not ideal now

## 39. Risk Badge

Examples:

* Heat risk
* Snow risk
* Road closure risk
* Fire/smoke risk
* Crowding risk
* Remote services

## 40. Plan B Card

Required fields:

* Trigger
* Alternative
* Why it works
* Distance/time difference

## 41. Activity Chip

Examples:

* Hiking
* Skiing
* Desert
* Coast
* Wildflowers
* Fall colors
* Scenic drive
* Cafe/town
* Family-friendly
* Non-hiker friendly

---

# Recommended MVP Screen Set

## 42. Build These First

For MVP, build only these screens:

1. Onboarding / Preferences
2. Now
3. Destination Detail
4. Plan Input
5. Destination Comparison
6. Generated Trip Plan
7. Saved Trips

Do not build the full Explore map first unless the map is central to the demo. A map looks impressive, but it can waste time. The decision engine matters more.

---

# MVP Demo Flow

## 43. Portfolio Demo Scenario

### Scenario

User is based in Bay Area and wants a 3-day trip next weekend with:

* scenic views
* moderate hiking
* good food/cafe options
* one non-hiker
* max 6-hour drive

### App Compares

* Yosemite
* Big Sur / Carmel
* Tahoe
* Mammoth
* Death Valley

### App Chooses

Best current destination based on season and conditions.

### App Shows

* Fit score
* Why this destination
* Why the alternatives are weaker
* 3-day plan
* Plan B
* non-hiker options
* lodging base guidance

This is the strongest demo because it proves the product is making a decision, not just generating travel text.

---

# UX Principle

OpenSeason should feel like a smart local friend who checks conditions before giving advice.

Not:

> Here are 50 things to do in California.

But:

> Given your dates, origin, group, and the current season, this is the trip I would take — and here is what I would avoid.
