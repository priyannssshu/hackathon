# ClubPulse — IIIT Jabalpur 🎓⚡
> **Campus Club Events & Advance Reminder Platform for PDPM IIITDM Jabalpur**  
> *A lightweight, zero-dependency web prototype built for the College Hackathon.*

---

## 🏛️ Tailored for PDPM IIITDM Jabalpur
**ClubPulse** is specifically designed for the vibrant student club culture of **IIIT Jabalpur**, unifying all campus sessions across **25 official clubs**:

### 💻 7 Technical Clubs
1. **The Programming Club (TPC)**
2. **Racing Club**
3. **Business and Management Club (BMC)**
4. **Electronics and Robotics Society (ERS)**
5. **CAD and 3D Printing**
6. **Astronomy and Physics Society (APS)**
7. **Aerofabrication Club**

### 🎭 6 Cultural Clubs
1. **Saaz** (Music Society)
2. **Jazbaat** (Dramatics Society)
3. **Aavartan** (Dance Club)
4. **Samvad** (Literature & Quizzing Club)
5. **Abhivyakti** (Arts & Design Club)
6. **Shutterbox** (Photography & Film Club)

### 🏆 12 Sports Clubs
1. **Volleyball**
2. **Football**
3. **Cricket**
4. **Basketball**
5. **Athletics**
6. **Gymnasium**
7. **Chess**
8. **Carrom**
9. **Kabaddi**
10. **Table Tennis**
11. **Badminton**
12. **Lawn Tennis**

---

## 📌 Problem & Solution
- **The Problem at IIITDMJ**: Important club workshops at Computer Center (CC-1), Nukkad Natak auditions at OAT, robotics sessions in the Mechatronics Lab, and football leagues get buried in crowded batch WhatsApp groups and unread hostel emails.
- **The Solution**: A clean, single-feed campus board where clubs publish sessions with verified campus venues and timings. Students can subscribe to get advance reminders (**15 mins, 1 hour, or 1 day prior**) on their devices.

---

## 🔔 Smart Notification Bar Behavior
* **Hidden by Default**: The top notification alert bar remains completely hidden when there are no active alerts.
* **Appears Only When Triggered**: When an upcoming event reminder triggers (or when the presenter clicks `⚡ Test Alert`), the top bar smoothly slides down with the alert details and a direct link to view the session.
* **Completely Removable**: Clicking **`✕ Dismiss`** immediately removes and hides the notification bar from view.
* **Notification Bell Center**: Tracks unread badge counts, active subscriptions, and allows 1-click clearing of all alerts.
* **Web Audio Chime**: Synthesizes a crisp 2-tone melodic notification chime directly in the browser (zero audio files needed).

---

## 📍 Campus Venues Supported
- **Computer Center (CC-1 / CC-2)**
- **LHC Lecture Halls (L-101 / L-102)**
- **Core Classroom Complex (CR-101 / CR-102)**
- **Student Activity Center (SAC)**
- **Open Air Theatre (OAT)**
- **Main Football Ground & Sports Arena**
- **Central Workshop & Mechatronics Lab**
- **Hall of Residence 3 / 4 / Panini**

---

## 🚀 How to Run the Prototype
No server installation or build steps required. Simply open `index.html` in any browser:
```powershell
# Open directly in Windows browser:
Start-Process "d:\hackathon\hackathon\index.html"
```

---

## 🎤 Hackathon Demo Script for Judges
1. **Introduction**: *"At IIIT Jabalpur, with 25 different technical, cultural, and sports clubs, students miss out on great sessions because flyers get lost in WhatsApp groups. ClubPulse provides one unified campus feed."*
2. **Filter Demo**: Select the **Technical** category chip or choose **"The Programming Club"** from the club dropdown to show instant filtering.
3. **Set Reminder**: Click **"Notify Me"** on the CodeRumble contest at CC-1.
4. **Live Alert Demo**: Click the **`⚡ Test Alert`** button in the navbar &rarr; witness the top notification bar slide down, the audio chime play, and the floating toast appear. Click **`✕ Dismiss`** to show how cleanly the alert is removed.
5. **Post Event**: Click **"+ Post Club Event"**, pick one of IIIT Jabalpur's 25 clubs from the dropdown, select a venue like `L-101` or `OAT`, and publish live to the feed.