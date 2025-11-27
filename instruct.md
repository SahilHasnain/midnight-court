## ✅ APP NAME

**Midnight Court**

## ✅ CORE PURPOSE

Build a **mobile-first React Native app** that allows law students to create **multi-slide presentations with images** and export them as a **professional PDF**, fully on mobile, without design skills.

---

# ✅ ULTIMATE OUTCOME

User should be able to:

✅ Choose a law-focused template
✅ Add multiple slides
✅ Add/edit text
✅ **Add an image to each slide** (optional but supported)
✅ Auto-save progress locally
✅ Export the entire presentation as a clean, professional **PDF with images + text**
✅ Do all this **on a phone** in under 10 minutes

---

# ✅ MUST-HAVE FEATURES (MVP)

### ✅ 1) Templates

Templates list:

* Title Slide
* Case Summary
* Judgement
* Arguments vs Counter
* Legal Precedent
* Verdict & Conclusion

Each template gives a default heading + subtitle.

---

### ✅ 2) Multi-Slide Editor

User can:

* Add slide
* Delete slide
* Navigate slides
* Edit heading
* Edit subheading
* Add bullet points
* Delete bullet points

Slides stored as an array:

```js
[
  {
    title: "",
    subtitle: "",
    points: [],
    image: null
  }
]
```

---

### ✅ 3) **Image Support (CRITICAL)**

Each slide must support **one image**:

Requirements:

* Pick from gallery
* Preview inside slide editor
* Replace/remove image
* Image should appear in final PDF
* Maintain aspect ratio
* Scaled properly (not stretched)

---

### ✅ 4) Local Auto-Save

Use AsyncStorage to:

* Save presentation on every change
* Restore on app restart
* List saved presentations in “My Presentations”

No backend needed.

---

### ✅ 5) **PDF Export (With Images)**

PDF must include:

* One slide per page
* Dark theme background (#0B1120)
* Gold accent (#CBA44A)
* Heading (serif look)
* Subheading
* Bullet points
* **Image centered at the top**

Layout priority:

1. Image
2. Heading
3. Subtitle
4. Points

Images must export cleanly and not pixelate.

---

# ✅ APP FLOW

```
/ (index.js — redirects only)
/home
/templates
/editor   (multi-slide + images)
/export   (PDF generation)
/presentations (saved decks)
```

`index.js` = NO UI. Redirect only.

---

# ✅ TECH REQUIREMENTS

* React Native + Expo
* JavaScript (NO TypeScript)
* Expo Router
* AsyncStorage
* PDF generation library compatible with images
* Theming support for “Midnight Court” dark theme

---

# ✅ UI REQUIREMENTS

**Theme: Midnight Court**

* Background: #0B1120
* Gold: #CBA44A
* Text: White
* Cards: #111827

Tone:

* Professional
* Elegant
* Law-centric
* Minimal

Slide layout must always reserve space for an image, even if none is added.

---

# ✅ SUCCESS CRITERIA

The MVP is complete when:

✅ User makes a 6-slide legal presentation
✅ Adds at least one image
✅ Saves automatically
✅ Exports a clean PDF with images + text
✅ Entire workflow happens on mobile

If this works → mission accomplished.

---
