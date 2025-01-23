# **Data-Visualization: Metro-Velov Usage in Lyon**

## **Description**
This project provides an in-depth analysis and visualization of bike-sharing usage (Vélo'v) in Lyon in relation to the proximity of metro stations. Using data from the Grand Lyon API, the project identifies patterns of bike activity and highlights the spatial and temporal correlation between metro schedules and bike usage. 

The visualization incorporates various datasets and offers interactive tools for users to explore the data dynamically. Initially, the project aimed to analyze a full month of data, but performance limitations led to optimizations for smoother interaction.

## **Web Interface**
Access the live project here: [All-in-One Dashboard](https://t8trust.github.io/DataViz-Metro-Velov-Lyon/allinone)

---

## **Data Sources**
The datasets used in this project are sourced from the [Grand Lyon API](https://grandlyon.com/api) and include:
1. **Metro Stations**: Location and details of metro stations.
2. **Metro Lines**: Information about metro lines and routes.
3. **Vélo'v Stations**: Location and availability of bike-sharing stations.
4. **Bike Availability**: Real-time and historical availability of bikes.
5. **Optional Data**: Weather and event data for advanced correlation analysis.

---

## **Project Members**
- **Maouche Massinissa**
- **Mecheri Jawad**
- **Slimani Abdennour**
- **Mayouf Lotfi**

---

## **Installation**

1. **Clone the repository**:
    ```bash
    git clone https://github.com/etulyon1/DataViz-Metro-Velov-Lyon.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd DataViz-Metro-Velov-Lyon
    ```

3. **Open the project in Visual Studio Code**:
    ```bash
    code .
    ```

---

## **Usage**

1. Open `allinone.html` in your web browser to access the dashboard that integrates multiple visualizations:
   - Heatmap for bike availability.
   - Temporal analysis of bike usage.
   - Comparative analysis of metro-adjacent and remote stations.

2. Use the **sliders** to filter by date and time for interactive exploration of bike usage patterns.

3. Access related project documentation:
   - [Wiki (Cahier d'Avancement)](https://github.com/t8trust/DataViz-Metro-Velov-Lyon/wiki)
   - [Intermediate Cadrage Document](https://docs.google.com/document/d/1d1YC1I8Gz816XKVpa9bxABRAt-yk17QlYVmlKCe8Ek0/edit?usp=sharing)

---

## **Features**
- **Interactive Heatmap**: Displays bike usage intensity across all Vélo'v stations.
- **Temporal Graphs**: Analyze hourly and daily patterns of bike usage.
- **Metro-Bike Correlation**: Visualize the relationship between metro arrivals and bike activity near stations.
- **Dashboard Integration**: All visualizations are consolidated into a single interactive interface.
- **Dynamic Filtering**: Adjust analysis by date, time, or station proximity.

---

## **Technologies Used**
- **Frontend**: HTML, CSS, JavaScript.
- **Visualization Libraries**: D3.js, Leaflet.js.
- **Data Sources**: Grand Lyon API (real-time and historical datasets).

---

## **Challenges & Optimization**
- Initial attempts to analyze a full month of data caused performance bottlenecks during loading and interaction.
- Optimizations included:
  - Splitting large datasets for better loading speeds.
  - Asynchronous data fetching to improve interactivity.
  - Adjusting the time frame for smoother visualization rendering.

---

## **License**
