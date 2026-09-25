# RePlate
# 🍱 RePlate — Surplus Food Redistribution Platform

> **From surplus food to someone's next meal — before it goes to waste.**

RePlate is a real-time food redistribution platform that connects **restaurants, hotels, cafeterias, and food businesses** with **NGOs, shelters, and verified recipients** to efficiently redistribute safe surplus food.

The platform simplifies the complete process — from **food listing and quality verification to matching, pickup, OTP-based delivery, and impact tracking**.

---

## 🚨 Problem

Every day, large quantities of edible food are discarded by restaurants, hotels, events, and other food businesses while nearby organizations and communities may need food.

The major challenges are:

* Surplus food has a limited usable time window.
* Donors often lack an efficient way to find suitable recipients.
* Manual coordination makes pickups difficult.
* Food handling and delivery need better tracking.
* There is limited visibility into the actual social and environmental impact.

---

## 💡 Our Solution

**RePlate creates a real-time digital bridge between food donors, recipients, and delivery partners.**

### 🔄 How RePlate Works

```text
Food Business
     ↓
Create Surplus Listing
     ↓
AI Food Quality & Expiry Check
     ↓
Nearby NGO / Shelter Matching
     ↓
Pickup Request
     ↓
Driver Assignment
     ↓
OTP-Based Handover
     ↓
Food Delivered
     ↓
Impact Recorded
```

---

## ✨ Key Features

### 🍱 Real-Time Surplus Listing

Donors can list:

* Food type
* Quantity
* Preparation time
* Best-before time
* Pickup location
* Food category

### 🤖 AI Food Quality & Expiry Detection

Donors can upload food or packaging images.

AI can assist in:

* Detecting visible spoilage indicators
* Reading expiry / best-before dates using OCR
* Identifying packaging information
* Flagging listings that require manual verification

> AI provides an assistance layer; final food-safety decisions should follow applicable food-safety requirements and verification procedures.

### 📍 Smart Recipient Matching

The platform considers factors such as:

* Distance
* Food quantity
* Recipient requirements
* Available pickup window
* Food expiry window

to help connect surplus food with suitable nearby recipients.

### 🚗 Driver & Pickup Management

Drivers can:

* View assigned pickups
* Navigate to pickup locations
* Update pickup status
* Confirm food collection
* Deliver food to the recipient

### 🔐 OTP-Based Handover

Secure pickup and delivery confirmation using OTP verification.

```text
Donor → Pickup OTP → Driver
Driver → Delivery OTP → Recipient
```

This creates a simple digital confirmation trail.

### 📊 Impact Dashboard

Track:

* Food redistributed
* Meals provided
* Donations completed
* Food waste reduced
* Successful pickups
* Successful deliveries

### 👨‍💼 Admin Portal

Admins can monitor:

* Users
* Donors
* NGOs / shelters
* Drivers
* Active listings
* Pickup & delivery status
* Reported issues
* Verification status
* Platform activity
* Impact statistics

---

## 👥 User Roles

| Role             | Main Responsibilities              |
| ---------------- | ---------------------------------- |
| 🏪 Donor         | List and manage surplus food       |
| 🏠 NGO / Shelter | Request and receive available food |
| 🚗 Driver        | Pickup and deliver food            |
| 👨‍💼 Admin      | Monitor and manage the platform    |

---

## 🏗️ System Architecture

```text
                    ┌─────────────────┐
                    │     Users       │
                    │ Donor / NGO /   │
                    │ Driver / Admin  │
                    └────────┬────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   RePlate Frontend  │
                  │  Web / Mobile UI    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │     Backend API     │
                  │ Authentication      │
                  │ Listings            │
                  │ Matching            │
                  │ Orders & Tracking   │
                  └──────┬───────┬──────┘
                         │       │
              ┌──────────┘       └──────────┐
              ▼                             ▼
       ┌──────────────┐              ┌──────────────┐
       │   Database   │              │ AI Services  │
       │ Users        │              │ OCR          │
       │ Listings     │              │ Food Check   │
       │ Pickups      │              │ Expiry       │
       │ Deliveries   │              └──────────────┘
       └──────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Maps / Location │
                │ OTP / Alerts    │
                └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Lucide Icons

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB / PostgreSQL

### AI

* OCR for expiry-date extraction
* Image analysis for visible food-quality indicators
* Intelligent recipient matching

### Other Technologies

* OTP authentication
* Geolocation & Maps
* Real-time status tracking
* Cloud storage
* Notification services

---

## 🔐 Safety & Verification

RePlate is designed with food safety and accountability in mind.

The platform can maintain:

* Food preparation timestamp
* Best-before / expiry information
* Listing history
* Pickup confirmation
* Delivery confirmation
* User verification
* Digital transaction history

Food should only be redistributed when it meets applicable food-safety requirements.

---


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/replate.git
cd replate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_URL=your_api_url
OTP_API_KEY=your_otp_api_key
MAPS_API_KEY=your_maps_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🌱 Impact

RePlate aims to help build a more efficient food redistribution ecosystem by:

* ♻️ Reducing avoidable food waste
* 🍱 Redistributing usable surplus food
* 🤝 Connecting donors with local organizations
* 🚗 Streamlining pickup and delivery
* 📊 Making social impact measurable

---

## 🔮 Future Scope

* Predictive surplus generation
* Automated donor-recipient matching
* Route optimization for multiple pickups
* Multilingual voice-based listing
* Advanced food-quality verification
* Integration with food businesses and NGOs
* Real-time analytics and city-level food redistribution insights

---

## 👨‍💻 Team

Built with ❤️ for a hackathon by the  Code Stormers.

### RePlate

**Connect. Redistribute. Reduce Waste.**

---

## 📄 License

This project is developed for educational and hackathon purposes.
