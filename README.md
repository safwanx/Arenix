# README.md

## 1. Site Code Breakdown – How the Arenix Monitoring Dashboard Works

In this section, I’ll walk through the core structure and logic behind the Arenix crowd monitoring and dynamic pricing site. The project is split into two main parts: `crowd.html` for monitoring and `dynamic.html` for pricing. Both share the same `styles.css` for visual consistency.

### 🧠 Overall Goal

My goal was to build an interactive and data-rich UI that can:
- **Monitor real-time crowd activity** with video feeds and analytics.
- **Adapt ticket pricing** dynamically based on crowd demand and match characteristics.

---

### `crowd.html` + `crowd.js` – Real-Time Crowd Monitoring

This page shows a live dashboard tracking crowd flow and density at a stadium. It includes metrics like **total count**, **alerts**, **incidents**, and **average density per m²**.

- The videos (normal view, density map, and overlay) switch dynamically based on the user's selection.
- Real-time stats like flow rate and density update every second using JavaScript intervals.
- Alerts and recommendations are generated and displayed based on internal thresholds.

The JS file `crowd.js` powers everything:
- It initializes all video elements and plays them.
- A live density chart (Chart.js) displays the trend over time.
- Alerts and recommendations are injected dynamically into the DOM.
- The crowd data is simulated and updated in real-time to mimic actual feed behavior.

### `dynamic.html` + `dynamic.js` – Dynamic Ticket Pricing

This page calculates ticket prices using a formula based on:
- Base price of the match.
- **Team Strength** (based on FIFA ratings).
- **Attendance** (based on expected vs. actual attendance).
- **Match type** (further stages of the tournament) further tweaks the price logic.

The `dynamic.js` file:
- Calculates **final ticket prices** dynamically.
- Updates a **pricing trend chart** comparing base vs final prices.
- Breaks down each component and then is equally weighted in using the formula.
- Adds color-coded badges showing demand level (high, low, or optimal).

## 🎯 Dynamic Pricing Formula

To determine the final dynamic ticket price, we applied a weighted formula that considers multiple match-specific factors.

The formula used is:
$$
\text{Dynamic Price} = \text{Base Price} \times \left( 0.5 + 1.5 \times \frac{TS_n + AT_n + MT_n}{3} \right)
$$


Where:
- **Base Price** is the initial ticket price for a match.
- **TSₙ** = Normalized Team Strength (e.g., based on team FIFA ratings)
- **ATₙ** = Normalized Audience attendance (predicted vs actual)
- **MTₙ** = Normalized Match Type (e.g., final, group stage)

This formula dynamically adjusts the base price by applying a multiplier that depends on the overall "attractiveness" of the match, ensuring ticket pricing reflects real-time demand and competitive value.


Users can interact by choosing to view data by day, week, or month – and can click to simulate new pricing based on updated crowd flow.

### `styles.css` – Design System

The CSS ties everything together with a sleek dark theme using purple and blue gradients. We used CSS variables to keep the color scheme clean and consistent. Cards, tables, badges, progress bars, and responsive design are all handled here.

---

## 2. MAN – Backend Script for Crowd Video Analysis
- The estimated **number of people** in each frame.
- A **heatmap** showing crowd density.
- A **visual overlay** that blends the heatmap with the raw video.

### 🛠 How it Works

1. **Model Initialization:**
   - We used a pre-trained `vgg19`-based density estimation model from a custom library.
   - Torch is used for deep learning inference and OpenCV for handling video frames.

2. **Frame Processing:**
   - Each video frame is converted and passed through the model.
   - The model outputs a **density map** which gets visualized as:
     - A heatmap.
     - An overlay on the original frame.
     - A clean count label (e.g. `Count: 132`).

3. **Output Generation:**
   - For every input video, three new videos are created:
     - `*_count.mp4`: video with person count.
     - `*_density.mp4`: raw heatmap of crowd density.
     - `*_overlay.mp4`: blended video of original + heatmap.

4. **Automation:**
   - The script can process all videos in a directory and saves the result to a zip file (`crowd_vid4.zip`).
   - Uses `tqdm` for progress display and handles errors gracefully.

### 🔗 Link to the Frontend

The frontend (HTML/JS) uses the processed videos from this script as its core input. These videos are loaded into the video players on the crowd monitoring page.
