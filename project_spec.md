# Product Requirements

## 1. Who is the product for?
- **Purchasing / Supply Managers** in **ship management companies**
- Handling **everyday vessel requisitions** (stores & consumables, not spares)
- Working with **existing ERP systems**, **Excel exports**, and **email-based RFQ workflows**
- Experienced operators who need **speed, accuracy, and control**, not new systems to learn

---

## 2. What does the product do?

### Product Milestones

The product is a **lightweight AI layer** that sits on top of the current workflow and delivers four milestones:

1. **Milestone 1 — RFQ Drafting Assistant**  
   Converts approved requisitions from Excel into a **ready-to-send RFQ email**, automatically including vessel details, port, delivery date, item list, quantities, specifications, and standard company terms.

2. **Milestone 2 — Quotation Data Extractor**  
   Monitors RFQ reply emails and **extracts structured data** from PDF/image/doc quotations (items, prices, quantities, delivery time, currency) into a clean Excel/CSV comparison sheet.

3. **Milestone 3 — Smart Vendor Recommender**  
   Uses historical purchase data to **recommend relevant vendors per item and port** and provides historical price ranges for context, while keeping final control with the Purchasing Manager.

4. **Milestone 4 — Compliance & Anomaly Flagging Layer**  
   Flags missing or unclear information before sending RFQs and detects missing items or non-standard terms after quotations are received.

The Purchasing Manager always **reviews and decides**.

---

## 3. What problem does the product solve?
- Eliminates **manual RFQ drafting** from Excel
- Eliminates **manual retyping and comparison** of quotation data
- Reduces **errors, omissions, and missed items**
- Prevents **non-standard terms and obvious pricing issues**
- Saves time **without changing tools, processes, or responsibilities**

---

## Context

### Process Workflow (As-Is)
This is the **current operational reality** and must remain unchanged.  
The product integrates **on top of this flow**.

1. Captain submits requisitions in ship ERP  
2. Office receives requisitions  
3. Purchasing Manager approves selected items  
4. Approved requisitions are exported to **Excel**  
5. Purchasing Manager manually creates RFQs  
6. RFQs are sent by **email** to vendors/agents  
7. Quotes are received by **email**  
8. Purchasing Manager selects supplier and places the order

---

## Technical Requirements

### Maritime Purchasing Assistant – V1 Stack

#### Frontend
- **Next.js 14** (App Router + TypeScript + Tailwind CSS)

#### Hosting
- **Vercel** (Free Tier)

#### AI / LLM
- **OpenRouter** (DeepSeek R1 – Free)
  - ~1,000 requests/day with $10 one-time credit

#### Email Sending
- **Gmail SMTP** (via Nodemailer)

#### Email Receiving
- **Gmail MCP Server** (`@gongrzhe/server-gmail-autoauth-mcp`)

#### Database
- **SQLite** (`better-sqlite3`)

#### Scheduled Jobs
- **Vercel Cron Jobs**

#### Cost
- **$0/month** (or **$10 one-time** for higher rate limits)