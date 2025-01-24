# data-class-project3

Team Members:
- Sezer Bozoglan
- Hannah Miles-Kingrey
- Nathaniel Trief


# Project Overview and Purpose
## Research Question and Terminology
*Is there a relationship between the population density of a country and its migration trends?*

**Net Migration Rate** is "[t]he difference between the number of migrants entering and those leaving a country in a year, per 1,000 midyear population. May also be expressed in percent. A positive figure is known as a net immigration rate and a negative figure as a net emigration rate" [(Census.gov)](https://www.census.gov/glossary/?term=Net+migration+rate).

- A formula for calculating the net migration rate is:
- N = (I - E) / M X 1,000
  - N = Net migration rate
  - I = Number of immigrants entering the area
  - E = Number of emigrants leaving the area
  - M = Mid-year population

Source: [(Wikipedia)](https://en.wikipedia.org/wiki/Net_migration_rate#:~:text=The%20net%20migration%20rate%20is,positive%20net%20migration%20rate%20occurs.)
    
Note: Our original dataset did not multiply the migration percentage by 1,000 (to reflect per 1,000 people) so that was a step added to the JavaScript.

**Population Density** is how many people live in a given area.

## Methodology and Tools
- JavaScript, Leaflet, HTML, CSS, Chart.js
- ETL:
  1. Downloaded and cleaned CSV to show ten countries with the highest rates of migration in 2020.
  2. Created JSON and GeoJSON files for migration percentage and population density.
  3. Created JavaScript and HTML files to run a Leaflet map.
  4. Used Chart.js to create line charts of net migration data.
  5. Loaded into MongoDB

## Results
<ins> Leaflet Map: Net Migration and Population Density </ins>

Overview

![Leaflet View1]( )

Net Migration Rates (Circle Markers)

![Leaflet View1]( )

Population Density (Choropleth and Tooltips)

![Leaflet View1]( )

- Dashboards

# Instructions 
<ins> Leaflet Map: Net Migration and Population Densit </ins>
1. Clone the repo.
2. Open index.html and logicv3a.js.
3. For migration data, click on various ring markers to show net migration rates for a given country.
4. For population density data, use the dropdown menu to select every 10 years from 1967-2017.

<ins> Net Migration Charts </ins>
1. Clone the repo.
2. Open index2.html and logicv5.js
3. OR open [GitHub Pages Link](Link name here)

# Ethical Considerations
The World Bank terms of use allow for copying, distributing, adapting, displaying or including their data for commercial and noncommercial use at no cost under a Creative Commons Attribution 4.0 International License. Certain agreements are expected, including, clear attribution to World Bank and particular dataset name or source (if known).

# References and Attributions
- [Kaggle Dataset](https://www.kaggle.com/datasets/eliasdabbas/migration-data-worldbank-1960-2018)
- [World Migration Report](https://worldmigrationreport.iom.int/what-we-do/world-migration-report-2024-chapter-4/who-migrates-internationally-and-where-do-they-go-international-migration-globally-between-1995-2020)
