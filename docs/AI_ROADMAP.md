# 🚀 Midnight Court - AI Features Roadmap

## 📋 Overview

AI-powered features for legal presentation builder to make case preparation 10x faster and more professional. All features designed for **single-user, serverless architecture** with minimal cost (₹100-150/month total).

---

## 🎯 **Phase 1: MVP - Core AI Features** (Week 1-2)

_Goal: Ship 3 highest-impact features that save the most time_

### **Chunk 1.1: Infrastructure Setup** (Day 1-2)

**Goal:** Get Azure serverless infrastructure ready

**Tasks:**

- [ ] Create Azure account (free tier)
- [ ] Setup Azure Functions project (Node.js runtime)
- [ ] Configure CORS for React Native app
- [ ] Setup environment variables (.env)
- [ ] Test basic function deployment
- [ ] Setup local development environment (Azure Functions Core Tools)

**Deliverables:**

- Working `/api/health` endpoint
- Local dev environment running
- Deployed to Azure (test endpoint)

**Files to Create:**

```
backend/
  ├── package.json
  ├── .env.example
  ├── functions/
  │   └── health/
  │       ├── index.js
  │       └── function.json
  └── host.json
```

**Cost:** ₹0 (free tier)

---

### **Chunk 1.2: Stock Photo Search** (Day 3-4)

**Goal:** Easiest feature, zero cost, immediate value

**Tasks:**

- [ ] Get Unsplash API key (free)
- [ ] Get Pexels API key (free)
- [ ] Create React Native ImageSearchModal component
- [ ] Implement search UI (search bar + grid)
- [ ] Add download & insert logic
- [ ] Add attribution to image caption
- [ ] Test with common legal queries

**Deliverables:**

- Working image search in app
- Download & auto-insert functional
- Attribution added automatically

**Files to Create:**

```
components/
  └── ImageSearchModal.jsx
utils/
  └── imageSearchAPI.js
```

**API Integration:**

```javascript
// No Azure needed, direct API calls
const UNSPLASH_KEY = "your_free_key";
const PEXELS_KEY = "your_free_key";
```

**Cost:** ₹0 (completely free)

---

### **Chunk 1.3: Legal Citation Finder - Backend** (Day 5-6)

**Goal:** Build citation search API with caching

**Tasks:**

- [ ] Setup Indian Kanoon scraper/API integration
- [ ] Create Azure Function: `/api/find-citations`
- [ ] Implement caching layer (Azure Table Storage - free)
- [ ] Build constitutional articles database (JSON file)
- [ ] Implement GPT fallback for rare queries
- [ ] Add rate limiting
- [ ] Test with 20+ common legal terms

**Deliverables:**

- Working `/api/find-citations` endpoint
- Cache reduces 60% of GPT calls
- Fast response (<2 seconds)

**Files to Create:**

```
backend/
  └── functions/
      └── find-citations/
          ├── index.js
          ├── legalDB.json (constitutional articles)
          ├── cache.js
          └── function.json
```

**Prompt Template:**

```javascript
const prompt = `Find relevant Indian legal citations for: "${query}"
Include:
1. Case names with year
2. Constitutional articles
3. Relevant acts/sections
Format as JSON array.`;
```

**Cost:** ₹20-25/month (with caching)

---

### **Chunk 1.4: Legal Citation Finder - Frontend** (Day 7)

**Goal:** Beautiful citation search UI in app

**Tasks:**

- [ ] Create CitationSearchModal component
- [ ] Add search input with debouncing
- [ ] Display results (case name, year, summary)
- [ ] One-tap insert into Quote block
- [ ] Add loading states & error handling
- [ ] Test end-to-end flow

**Deliverables:**

- Citation search accessible from editor
- Results display cleanly
- Insert to Quote block works

**Files to Create:**

```
components/
  └── CitationSearchModal.jsx
utils/
  └── citationAPI.js
```

**UI Flow:**

1. User taps "Find Citation" in editor
2. Modal opens with search bar
3. Types "right to privacy"
4. Shows 3-5 relevant citations
5. Tap one → Auto-fills Quote block

**Cost:** Frontend only, no additional cost

---

### **Chunk 1.5: Smart Slide Generation - Prompt Engineering** (Day 8-9)

**Goal:** Perfect the AI prompt for slide generation

**Tasks:**

- [ ] Create test dataset (10 sample case descriptions)
- [ ] Write base prompt template
- [ ] Test with phi-3-mini model
- [ ] Iterate on output format (JSON structure)
- [ ] Handle edge cases (short input, long input)
- [ ] Add block type selection logic
- [ ] Validate generated slide structure

**Deliverables:**

- Stable prompt that generates valid slides 95%+ of time
- JSON output matches app's slide structure
- Handles 200-2000 character inputs

**Prompt Template:**

```javascript
const systemPrompt = `You are a legal presentation expert. 
Convert case descriptions into structured slides.

Available block types:
- text: Bullet points
- quote: Legal citations
- callout: Important highlights
- timeline: Case progression
- evidence: Evidence details
- twoColumn: Arguments vs Counter

Output ONLY valid JSON matching this structure:
{
  "slides": [
    {
      "title": "string",
      "subtitle": "string",
      "blocks": [
        {
          "type": "text",
          "data": { "points": ["point 1", "point 2"] }
        }
      ]
    }
  ]
}`;

const userPrompt = `Case description:
${userInput}

Generate 3-5 slides for a legal presentation.`;
```

**Cost:** ₹2-3 for testing (20-30 test runs)

---

### **Chunk 1.6: Smart Slide Generation - Backend** (Day 10)

**Goal:** Build the slide generation API

**Tasks:**

- [ ] Create Azure Function: `/api/generate-slides`
- [ ] Implement prompt from 1.5
- [ ] Add input validation (max 2000 chars)
- [ ] Parse JSON response safely
- [ ] Handle API errors gracefully
- [ ] Add response caching (optional)
- [ ] Test with real case descriptions

**Deliverables:**

- Working `/api/generate-slides` endpoint
- Handles errors without crashing
- Returns valid slide structure

**Files to Create:**

```
backend/
  └── functions/
      └── generate-slides/
          ├── index.js
          ├── prompts.js
          └── function.json
```

**Code Structure:**

```javascript
export default async function (context, req) {
  const { input } = req.body;

  // Validate input
  if (!input || input.length > 2000) {
    return { status: 400, body: "Invalid input" };
  }

  // Call Azure OpenAI
  const response = await openai.complete({
    model: "phi-3-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 800,
  });

  // Parse & validate
  const slides = JSON.parse(response.content);
  return { status: 200, body: slides };
}
```

**Cost:** ₹5-8/month

---

### **Chunk 1.7: Smart Slide Generation - Frontend** (Day 11)

**Goal:** Beautiful UI for slide generation

**Tasks:**

- [ ] Create SlideGeneratorModal component
- [ ] Add large text area for case description
- [ ] Add character counter (0/2000)
- [ ] Add "Generate Slides" button with loading state
- [ ] Display preview of generated slides
- [ ] Add "Use These Slides" action
- [ ] Replace current slides with generated ones
- [ ] Test with various inputs

**Deliverables:**

- Modal accessible from editor toolbar
- Smooth UX with loading states
- Generated slides load correctly

**Files to Create:**

```
components/
  └── SlideGeneratorModal.jsx
```

**UI Flow:**

1. User taps "Generate from Text" in editor
2. Modal opens with text area
3. Pastes case description
4. Taps "Generate"
5. Shows loading (2-3 sec)
6. Preview of 3-5 slides
7. Taps "Use These" → Slides replace current

**Cost:** Frontend only, no additional cost

---

### **Chunk 1.8: Testing & Polish** (Day 12-13)

**Goal:** Make MVP rock-solid

**Tasks:**

- [ ] End-to-end testing (all 3 features)
- [ ] Test with slow network
- [ ] Test error scenarios (API down, invalid response)
- [ ] Add better error messages
- [ ] Improve loading indicators
- [ ] Add success toasts/feedback
- [ ] Check cost monitoring (Azure portal)
- [ ] Document API endpoints
- [ ] Create user guide (how to use AI features)

**Deliverables:**

- All features work reliably
- Good error handling
- User documentation ready
- Cost within budget (₹25-33/month)

**Testing Checklist:**

- [ ] Stock photo search works offline/online
- [ ] Citation finder handles no results gracefully
- [ ] Slide generation handles malformed input
- [ ] All modals close properly
- [ ] Loading states show correctly
- [ ] Success feedback is clear

---

### **Chunk 1.9: Deployment & Handoff** (Day 14)

**Goal:** Ship to production

**Tasks:**

- [ ] Deploy all Azure Functions to production
- [ ] Update app with production API URLs
- [ ] Test in production environment
- [ ] Create backup/rollback plan
- [ ] Monitor first 24 hours of usage
- [ ] Document cost so far
- [ ] Create Phase 2 backlog

**Deliverables:**

- MVP live and working
- User can use all 3 features
- Cost monitoring dashboard setup
- Ready for Phase 2

**Production Checklist:**

- [ ] Environment variables set
- [ ] CORS configured for app domain
- [ ] Rate limiting enabled
- [ ] Error logging setup (Application Insights)
- [ ] API keys secured (Key Vault)

---

## Phase 1 Summary

**Total Time:** 14 days (2 weeks)  
**Features Shipped:** 3 (Stock Photos, Citations, Slide Generation)  
**Total Cost:** ₹25-33/month  
**User Impact:** 70-80% time saved in slide creation

**Day-by-Day Breakdown:**

- Day 1-2: Infrastructure
- Day 3-4: Stock Photos (FREE feature)
- Day 5-7: Legal Citations (Backend + Frontend)
- Day 8-11: Slide Generation (Prompt + Backend + Frontend)
- Day 12-14: Testing & Deployment

---

### 1.1 Smart Slide Generation from Text ⭐

**Priority:** CRITICAL  
**Impact:** 80% time saved in initial slide creation  
**Cost:** ₹5-8/month

**Feature:**

- User pastes/types case details
- AI generates complete slide deck with appropriate blocks
- Auto-selects best template based on case type

**Technical:**

- Azure Function (serverless, free tier)
- Azure OpenAI phi-3-mini model
- Endpoint: `/api/generate-slides`
- Input: Raw text (max 2000 chars)
- Output: Array of slides with blocks

**Prompt Engineering:**

```
"You are a legal presentation expert. Convert this case description into structured slides:
[User Input]

Output format:
- Slide 1: Case Overview (timeline blocks)
- Slide 2: Legal Grounds (callout blocks)
- Slide 3: Evidence (evidence blocks)
..."
```

**Token Usage:** ~300-500 per request  
**Latency:** 2-3 seconds (acceptable)

---

### 1.2 Legal Citation Finder ⭐⭐

**Priority:** CRITICAL  
**Impact:** Instant credibility, saves legal research hours  
**Cost:** ₹20-25/month

**Feature:**

- User types legal concept (e.g., "right to privacy")
- AI fetches relevant case laws, articles, sections
- One-tap insert into Quote blocks

**Technical:**

- Azure Function: `/api/find-citations`
- Custom legal knowledge base (Indian laws)
- Falls back to GPT for rare cases
- Caching for common queries (reduce cost)

**Data Sources:**

- Indian Kanoon API (free)
- Supreme Court judgments database
- Constitutional articles database
- Fallback: GPT-4 for context

**Token Usage:** ~300-500 per search  
**Cache Hit Rate:** 60-70% (saves money)

---

### 1.3 Stock Photo Search & Download 💰

**Priority:** HIGH  
**Impact:** No manual image hunting, professional look  
**Cost:** ₹0 (Free APIs)

**Feature:**

- User adds Image block, types query
- Shows 5-8 relevant free stock photos
- One tap to download and insert
- Auto-attribution added to caption

**Technical:**

- Unsplash API (50 req/hour FREE)
- Pexels API (200 req/hour FREE)
- Pixabay API (Unlimited FREE)
- No Azure cost, pure free tier

**Queries Optimized For:**

- "courtroom", "legal scales", "justice"
- "Supreme Court", "High Court building"
- "documents", "evidence", "gavel"

**Token Usage:** 0 (no AI needed, direct API)

---

## 🎨 **Phase 2: Polish Features** (Week 3-4)

_Goal: Enhance UX with smart assistants_

### 2.1 Markdown Auto-Formatter

**Priority:** MEDIUM  
**Impact:** Professional highlighting without manual syntax  
**Cost:** ₹5-10/month

**Feature:**

- User types normally in any text field
- AI auto-applies markdown formatting
- _Names_ in gold, ~Laws~ in red, _Entities_ in blue

**Technical:**

- Real-time suggestion (as user types)
- Endpoint: `/api/format-text`
- Debounced to 500ms (reduce calls)

**Example:**

```
Input: "The petitioner Ramesh Kumar filed under Article 32 against State"
Output: "The petitioner *Ramesh Kumar* filed under ~Article 32~ against _State_"
```

**Token Usage:** ~50-100 per block  
**Smart Caching:** Cache formatting patterns

---

### 2.2 Block Content Auto-Complete

**Priority:** MEDIUM  
**Impact:** Faster typing, context-aware suggestions  
**Cost:** ₹10-15/month

**Feature:**

- User starts typing in Quote/Text/Callout blocks
- AI suggests completion based on block type
- Accept with Tab or continue typing

**Technical:**

- Endpoint: `/api/autocomplete`
- Different prompts per block type
- Debounced to 800ms

**Block-Specific Logic:**

- Quote block → Legal quotes database
- Text block → Common legal phrases
- Evidence block → Evidence description templates

**Token Usage:** ~100 per suggestion  
**User Control:** Toggle on/off in settings

---

### 2.3 Document Photo Auto-Enhancer 📸

**Priority:** MEDIUM  
**Impact:** Professional document scans from phone camera  
**Cost:** ₹0 (On-device ML)

**Feature:**

- User takes photo of legal document
- Auto-detects edges and crops
- Perspective correction (straightens)
- Enhances contrast, removes shadows
- Scan-quality output

**Technical:**

- React Native Vision Camera
- ML Kit Document Scanner (FREE)
- On-device processing (no server cost)
- Works offline

**Use Cases:**

- Court orders
- FIR copies
- Evidence documents
- Witness statements

**Token Usage:** 0 (no cloud AI)

---

## 🚀 **Phase 3: Advanced Intelligence** (Week 5-6)

_Goal: Power-user features for maximum efficiency_

### 3.1 Template Recommendation Engine

**Priority:** LOW  
**Impact:** Reduces decision paralysis  
**Cost:** ₹3-5/month

**Feature:**

- User describes case in 1-2 sentences
- AI recommends best template + customizations
- Shows suggested block types to add

**Technical:**

- Endpoint: `/api/recommend-template`
- Lightweight classification model
- Rule-based + AI hybrid approach

**Example:**

```
Input: "Criminal appeal, murder case, witness contradictions"
Output:
- Template: "Complete Case"
- Add: Evidence blocks (witness statements)
- Add: Two-Column (prosecution vs defense)
```

**Token Usage:** ~150 per query

---

### 3.2 Auto-Caption Generator for Images

**Priority:** LOW  
**Impact:** Consistent professional captions  
**Cost:** ₹5-10/month

**Feature:**

- User uploads evidence image
- AI generates legal-style caption
- Includes date, exhibit number, description

**Technical:**

- Azure Computer Vision (image analysis)
- GPT for caption generation
- Endpoint: `/api/generate-caption`

**Output Format:**

```
"Exhibit [A/B/C]: [Description], photographed on [Date] at [Time]"
```

**Token Usage:** ~100 per image

---

### 3.3 Bulk Image Organizer

**Priority:** LOW  
**Impact:** One action → Entire image section ready  
**Cost:** ₹8-12/month

**Feature:**

- User selects multiple photos from gallery
- AI categorizes (documents vs evidence vs locations)
- Auto-creates appropriate blocks (Grid vs Individual)
- Generates captions for each

**Technical:**

- Image analysis batch processing
- Endpoint: `/api/organize-images`
- Smart grouping algorithm

**Logic:**

- Similar images → Image Grid (2x2)
- Documents → Individual Center blocks
- Mixed content → Separate by type

**Token Usage:** ~200 per batch

---

### 3.4 PDF Summary Generator

**Priority:** LOW  
**Impact:** Helps with court presentation prep  
**Cost:** ₹10-15/month

**Feature:**

- After creating presentation → User taps "Generate Script"
- AI analyzes all slides
- Generates talking points and flow

**Technical:**

- Endpoint: `/api/generate-summary`
- Analyzes entire presentation structure
- Outputs bullet-point script

**Output:**

```
Opening: Introduce case [Name] v. [Name]
Key Points:
1. [First major argument]
2. [Supporting evidence]
3. [Legal precedent]
Closing: [Recommendation]
```

**Token Usage:** ~500-800 per presentation

---

### 3.5 Slide Reordering Suggestions

**Priority:** VERY LOW  
**Impact:** Improves presentation flow  
**Cost:** ₹5-8/month

**Feature:**

- AI analyzes slide order
- Suggests better sequence
- One-tap to accept/reject

**Technical:**

- Endpoint: `/api/suggest-order`
- Rule-based + AI scoring
- Considers legal presentation best practices

**Token Usage:** ~200 per analysis

---

## 💰 **Cost Summary**

### Phase 1 (MVP):

```
Smart Slide Generation:     ₹5-8
Legal Citations:            ₹20-25
Stock Photos:               ₹0 (free)
──────────────────────────
Subtotal:                   ₹25-33/month
```

### Phase 2 (Polish):

```
Markdown Formatter:         ₹5-10
Auto-Complete:              ₹10-15
Document Enhancer:          ₹0 (on-device)
──────────────────────────
Subtotal:                   ₹15-25/month
```

### Phase 3 (Advanced):

```
Template Recommender:       ₹3-5
Auto-Captions:              ₹5-10
Bulk Organizer:             ₹8-12
PDF Summary:                ₹10-15
Slide Reordering:           ₹5-8
──────────────────────────
Subtotal:                   ₹31-50/month
```

### **TOTAL (All Features):**

```
₹71-108/month at moderate usage
₹100-150/month with buffer
```

---

## 🏗️ **Technical Architecture**

### Serverless Stack:

```
React Native App
    ↓ (HTTPS)
Azure Functions (Free Tier - 1M exec/month)
    ↓ (Serverless Inference)
Azure OpenAI (phi-3-mini)
    ↓ (Response)
App (Display Results)
```

### On-Device Stack (Zero Cost):

```
React Native App
    ↓
ML Kit / Vision Camera (Local Processing)
    ↓
Enhanced Image (No server involved)
```

### Hybrid Approach:

- **Free APIs:** Stock photos, legal databases
- **On-Device ML:** Document scanning, basic processing
- **Cloud AI:** Complex generation, citations, summaries

---

## 📊 **Implementation Timeline**

### Week 1-2: MVP

- [ ] Setup Azure Functions infrastructure
- [ ] Implement Smart Slide Generation
- [ ] Implement Legal Citation Finder
- [ ] Integrate Stock Photo Search (Unsplash)
- [ ] Basic error handling + loading states

### Week 3-4: Polish

- [ ] Add Markdown Auto-Formatter
- [ ] Implement Block Auto-Complete
- [ ] Integrate Document Scanner (ML Kit)
- [ ] Improve UI/UX for AI features
- [ ] Add settings toggle for AI features

### Week 5-6: Advanced

- [ ] Template Recommendation Engine
- [ ] Auto-Caption Generator
- [ ] Bulk Image Organizer
- [ ] PDF Summary Generator
- [ ] Slide Reordering (if time permits)

### Week 7: Testing & Optimization

- [ ] End-to-end testing with real cases
- [ ] Cost monitoring and optimization
- [ ] Performance tuning (reduce latency)
- [ ] User feedback integration

---

## 🎯 **Success Metrics**

### Time Saved:

- Slide creation: 70-80% faster
- Image handling: 60-70% faster
- Legal research: 50-60% faster
- **Overall:** 3-hour task → 45 minutes

### User Satisfaction:

- Professional output quality
- Minimal learning curve
- "Feels like magic" moments

### Cost Efficiency:

- Stay under ₹150/month
- 90%+ feature usage on free/cheap tier
- No wasted API calls

---

## 🔒 **Security & Privacy**

### Data Handling:

- No case data stored on servers
- All AI requests ephemeral (not logged)
- Images processed and deleted immediately
- GDPR/Data Protection compliant

### API Keys:

- Stored in Azure Key Vault
- Environment variables only
- No hardcoded secrets

---

## 🚢 **Deployment Strategy**

### Phase 1 Release (MVP):

- Ship with 3 core features
- Get user feedback
- Monitor costs and usage

### Phase 2 Release (Polish):

- Add UX improvements
- Enable based on user demand
- A/B test features

### Phase 3 Release (Advanced):

- Premium features (if needed)
- Advanced power-user tools
- Scale based on traction

---

## 💡 **Future Ideas (Post-Launch)**

- Voice-to-slide generation (speech input)
- Multi-language support (Hindi, regional languages)
- Collaborative editing (if more users)
- AI-powered argument strength analyzer
- Case outcome prediction (based on precedents)

---

**Built for:** Single user, legal professional  
**Optimized for:** Speed, cost-efficiency, professional output  
**Infrastructure:** 100% serverless, pay-per-use  
**Total Cost:** ₹100-150/month (cheaper than one coffee per day)
