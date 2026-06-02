<div align="center">

🧩 [**Also available as a Chrome extension**](https://chrome.google.com/webstore/detail/star-history/iijibbcdddbhokfepbblglfgdglnccfn)

<a href="https://www.star-history.com/star-history/star-history">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/badge?repo=star-history/star-history&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/badge?repo=star-history/star-history" />
   <img alt="Star History Rank" src="https://api.star-history.com/badge?repo=star-history/star-history" />
 </picture>
</a>

# :sparkles: Star History :sparkles:
 
[**star-history.com**](https://star-history.com), **the de facto GitHub star history graph.**

<img src="https://raw.githubusercontent.com/star-history/star-history/main/assets/nvidia-gtc-2026.webp" />

</div>

---

### 📊 Live Embedding

You can embed live charts and badges directly into your GitHub README or website.

| Style | Example Preview | HTML Snippet |
| :--- | :--- | :--- |
| **Standard Chart** | <a href="https://star-history.com/star-history/star-history"><img width="300" src="https://api.star-history.com/chart?repos=star-history/star-history&type=date&theme=light" /></a> | See below |
| **Landscape Card** | <a href="https://star-history.com/star-history/star-history"><img width="300" src="https://api.star-history.com/chart?repos=star-history/star-history&style=landscape1" /></a> | See below |
| **Global Rank Badge** | <a href="https://star-history.com/star-history/star-history"><img src="https://api.star-history.com/badge?repo=star-history/star-history" /></a> | See below |

#### Standard Chart Snippet
```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=star-history/star-history&type=date&theme=dark&legend=top-left" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=star-history/star-history&type=date&legend=top-left" />
  <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=star-history/star-history&type=date&legend=top-left" />
</picture>
```

#### Landscape Card Snippet
```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=star-history/star-history&style=landscape1&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=star-history/star-history&style=landscape1" />
  <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=star-history/star-history&style=landscape1" />
</picture>
```

#### Global Rank Badge Snippet
```html
<a href="https://star-history.com/star-history/star-history">
  <img alt="Star History Rank" src="https://api.star-history.com/badge?repo=star-history/star-history" />
</a>
```

---

### PaddleOCR

[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR?utm_source=star-history) is a production-ready OCR & document AI for end-to-end text extraction and document understanding.

<a href="https://github.com/PaddlePaddle/PaddleOCR?utm_source=star-history"><img src="https://raw.githubusercontent.com/star-history/star-history/main/frontend/public/assets/ft/paddleocr/landing.webp" /></a>

## ✨ Features

- **Unique** **`sketch xkcd`** feeling **chart**;
- **One-click** generation of **high-quality** image for chart;
- Support **multiple chart view** mode **`based on date or timeline`**;
- **Embed** the **real-time chart** into **`GitHub readme or other websites`** **(like the one we embed here on the top)**
- And **various** useful **functions**:
  - toggle **repo visibility**;
  - **shortcut** to input repo;
  - **share** on **`Twitter`** **quickly**;
  - **support** input **multiple repos**;
  - ...waiting **for you** to **find out!**

## 🌠 Screenshots

<a href="https://star-history.com"><img width="800px" src="https://user-images.githubusercontent.com/24653555/154391264-312b448b-f851-41bf-bb8d-4c21ec6795b6.gif" />
</a>

### 🧩 [Free chrome extension](https://chrome.google.com/webstore/detail/star-history/iijibbcdddbhokfepbblglfgdglnccfn)

<a href="https://chrome.google.com/webstore/detail/star-history/iijibbcdddbhokfepbblglfgdglnccfn"><img width="800px" src="https://user-images.githubusercontent.com/24653555/154391326-61b65d8f-3f9f-4432-b773-5988be75b0ea.png" /></a>

## 🏗 Development

Star-history consists of a **Frontend** (Next.js), a **Backend** (Hono), and a **Data Pipeline** (gh).

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/)
- [sqlite3](https://sqlite.org/download.html) (required for the data pipeline)

### 1. Data Pipeline (Required for Frontend)

The frontend depends on JSON data generated from the `gh` pipeline. Generate these files first:

```shell
# Generate data files from star.db
node gh/star-generate-cli.js
```

### 2. Frontend

The main website at [star-history.com](https://star-history.com).

```shell
cd frontend
pnpm install
pnpm dev
```
Website runs at http://localhost:3000.

### 3. Backend (API Server)

Generates SVG charts and OG cards. Requires a `token.env` file in the `backend/` directory with GitHub tokens (one per line).

```shell
cd backend
pnpm install
pnpm dev
```
API runs at http://localhost:8080.

### 4. Chrome Extension

```shell
cd frontend
pnpm build:ext
```
Load the `./dist` folder as an unpacked project in your Chrome extensions page.
