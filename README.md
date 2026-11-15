# 🎓 NERIST Faculty Explorer

A fast, interactive 3D web application to search, explore, and connect with faculty members and administrative officers of the **North Eastern Regional Institute of Science & Technology (NERIST)**, Nirjuli, Arunachal Pradesh.

Live Web App: [NERIST Faculty Search](https://nerist-faculty-search.pages.dev/)

---

## ⚡ Key Features

- **3D Interactive Tilt Cards**: Modern glassmorphic cards with dynamic hover perspective and avatar color generation.
- **Smart Search & Acronym Matching**:
  - Full and partial name searches (e.g., `Rajesh Kumar`, `Mishra`).
  - **Initials & Acronyms**: Type `kr` for **Dr. Kaushik Ray**, `akr` for **Dr. Ashok Kumar Ray**, `mms` for **Dr. Madhusudhan Mishra**, etc.
  - Search by department, designation, research specialization, and email handle.
- **One-Click Communication**: Direct `tel:`, `mailto:`, and WhatsApp (`wa.me`) integration for instant messaging and calling.
- **Slide-in Detail Drawer**: Deep dive into research areas, full contact directories, EPABX extensions, and official institute profiles.
- **Dark / Light Theme Sync**: Persistent theme state with smooth transitions.

---

## 🔍 Data Architecture & Extraction Logic

The database (`faculty.json`) consolidates records across three institutional sources:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 NERIST Data Sources                    │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
         ┌───────────────────────────────────┼──────────────────────────────────┐
         │                                   │                                  │
         ▼                                   ▼                                  ▼
┌─────────────────────────┐     ┌─────────────────────────┐        ┌─────────────────────────┐
│  1. NERIST WP REST API  │     │ 2. SymphonyX ERP System │        │ 3. Administrative Portal│
│  /wp-json/wp/v2/faculty │     │   nerist.symphonyx.in   │        │   nerist.ac.in/org/     │
└────────────┬────────────┘     └────────────┬────────────┘        └────────────┬────────────┘
             │                               │                                  │
   • Bio & Designations            • Establishment IDs (EST-)         • Group 'A' Officers
   • Public Profiles & Photos      • Direct Unmasked Mobiles          • Direct Desk BSNL Lines
   • EPABX Switchboard Exts        • Personal WhatsApp Lines          • Section Email Routing
             │                               │                                  │
             └───────────────────────┬───────┴──────────────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    Consolidated Database     │
                      │ 328 Cleaned & Verified Entry │
                      └──────────────────────────────┘
```

### 1. Official WordPress REST API (`nerist.ac.in/wp-json/wp/v2/faculty`)
* Crawls individual permanent faculty posts.
* Parses bio HTML to retrieve verified email addresses (`@nerist.ac.in`), designations, profile images, and research areas.

### 2. SymphonyX Academic ERP (`nerist.symphonyx.in`)
* Internal university ERP tracking establishment records (`EST-XXX/5/YYYY`).
* **Unmasked Mobiles**: Used to retrieve verified personal 10-digit mobile numbers for faculty members whose public profiles either omitted them or masked them (e.g., Dr. Madhusudhan Mishra `6295728068` under `EST-765/5/2006`, Dr. Nitish Kumar `9476702170` under `EST-1016/5/2025`).

### 3. Central Administrative Registry (`nerist.ac.in/organisation/`)
* Indexes key administrative officers (Registrar, Assistant Registrars).
* Documents official direct desk lines and switchboard extensions.

---

## 📞 Phone Number Verification & Contact Accuracy Rules

1. **Fixed Landlines vs. Cellular Mobiles:**
   * Administrative officers (such as **Dr. Gautam Kumar Roy**, Assistant Registrar Academic) use official BSNL Direct Desk Lines (**`0360-2257565`**, EPABX Ext. **`6008`**).
   * Fixed wireline numbers cannot receive SMS or activate WhatsApp accounts; they are dialed directly via telephone during office hours (09:00 AM – 05:00 PM, Mon–Fri).
2. **Strict Attribution & De-conflation:**
   * Cellular numbers are strictly mapped to the exact individual:
     * **Prof. Sarsing Gao** (Senior Professor, Electrical Engineering / Former Dean Academic) holds mobile numbers **`8257880866`** and **`9362920528`**.
     * **Dr. Gautam Kumar Roy** is strictly mapped to his direct desk line `0360-2257565` and `dracad@nerist.ac.in`.
3. **No Dummy Placeholders:**
   * All dummy ERP placeholder values (`9999999999`, `9400000000`) for temporary scholar IDs have been purged to ensure every displayed number is legitimate.
4. **Embedded Number Extraction:**
   * Numbers previously trapped inside freeform profile notes (e.g., Ms. Yumnam Bidyalaxmi Devi `9436258565`, Mr. Konthoujam James Singh `9856672096`, Mr. Moirangthem Edison Singh `8415022686`) are extracted to dedicated primary contact fields.

---

## 🛠️ Tech Stack & Development

- **Framework**: React 19 + Vite 6
- **Styling**: Vanilla CSS with CSS custom properties, glassmorphism, responsive CSS grid
- **Icons**: Lucide React + custom inline SVGs

### Running Locally

```bash
# Clone the repository
git clone https://github.com/unknown724/nerist-faculty-explorer.git
cd nerist-faculty-explorer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

MIT License. Designed for NERIST students, scholars, and academic community.
