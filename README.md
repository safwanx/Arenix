# README.md

## 1. Site Code Breakdown – How the Arenix Monitoring Dashboard Works

In this section, we’ll walk through the core structure and logic behind the Arenix crowd monitoring and dynamic pricing site. The project is split into two main parts: `crowd.html` for monitoring and `dynamic.html` for pricing. Both share the same `styles.css` for visual consistency.

### 🧠 Overall Goal

Our goal was to build an interactive and data-rich UI that can:
- **Monitor real-time crowd activity** using video feeds and live analytics.
- **Adapt ticket pricing** dynamically based on crowd demand and match characteristics.

---

### `crowd.html` + `crowd.js` – Real-Time Crowd Monitoring

This page displays a live dashboard that tracks crowd flow and density at a stadium. It includes metrics such as **total count**, **alerts**, **incidents**, and **average density per m²**.

Key features:
- Users can toggle between video views (normal, density map, overlay).
- Real-time stats like flow rate and density update every second.
- Alerts and action recommendations are dynamically generated based on simulated data.

The `crowd.js` file powers this experience by:
- Initializing video elements and ensuring seamless playback.
- Creating a live density chart using Chart.js.
- Managing the injection of alert and recommendation content into the DOM.
- Simulating crowd data changes to mimic a real-time monitoring system.

---

### `dynamic.html` + `dynamic.js` – Dynamic Ticket Pricing

This page handles ticket pricing using a custom formula that factors in:
- **Base price** of the match.
- **Team strength** based on FIFA ratings.
- **Audience attendance**, comparing predicted vs. actual values.
- **Match type**, which adjusts the pricing based on its significance (e.g., finals, group stage).

Key functionalities in `dynamic.js`:
- Real-time calculation of **final ticket prices**.
- A visual chart comparing base prices vs. final prices.
- Component breakdown of the pricing formula.
- Badges showing demand level (High, Low, or Optimal).
- Users can toggle views by day, week, or month, and simulate new prices with a single click.

---

## 🎯 Dynamic Pricing Formula

To determine the final dynamic ticket price, we applied a weighted formula that considers multiple match-specific factors:

$$
\text{Dynamic Price} = \text{Base Price} \times \left( 0.5 + 1.5 \times \frac{TS_n + AT_n + MT_n}{3} \right)
$$

Where:
- **Base Price** is the initial ticket price for a match.
- **TSₙ** = Normalized Team Strength (e.g., based on team FIFA ratings).
- **ATₙ** = Normalized Audience Attendance (predicted vs. actual).
- **MTₙ** = Normalized Match Type (e.g., final, group stage).

This formula dynamically adjusts the base price by applying a multiplier based on the overall "attractiveness" of a match, ensuring pricing reflects demand and context in real time.

---

### `styles.css` – Design System

The shared CSS file ties the entire front end together with a modern dark theme using purple and blue gradients. We used CSS variables for consistency across cards, tables, progress bars, and badges. The design is also responsive to support mobile devices.

---

## 2. MAN – Backend Script for Crowd Video Analysis

This backend Python script processes raw stadium footage and generates:
- A **count-labeled video** showing the number of people per frame.
- A **heatmap** showing crowd density visually.
- An **overlay video** blending the original footage with the heatmap.

### 🛠 How It Works

1. **Model Initialization:**
   - We used a pre-trained VGG19-based crowd estimation model.
   - Torch is used for inference and OpenCV handles video input/output.

2. **Frame Processing:**
   - Each frame is passed through the model, which produces a density map.
   - Outputs are:
     - A heatmap.
     - An overlay with the original frame.
     - A frame annotated with person count.

3. **Output Generation:**
   - For each input video, the script outputs:
     - `*_count.mp4`: annotated with person count.
     - `*_density.mp4`: raw density heatmap.
     - `*_overlay.mp4`: blended view.
   - All outputs are compressed into a single zip (`crowd_vid4.zip`).

4. **Automation:**
   - The script scans a folder, processes all compatible videos, and handles errors gracefully.
   - A progress bar via `tqdm` keeps users informed throughout the processing.

---

### Link to the Frontend

The frontend (HTML/JavaScript) loads and displays the processed videos from the backend directly within the monitoring dashboard, making the analytics visually interactive and informative.
