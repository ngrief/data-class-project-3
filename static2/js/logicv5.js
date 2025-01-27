// Helper function to generate unique colors for each country
function getUniqueColor(index) {
    const colors = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
    return colors[index % colors.length];
}

// Populate the universal country key dynamically
function populateUniversalCountryKey(countries, datasets, charts) {
    const countryList = document.getElementById('universal-country-list');
    countryList.innerHTML = ''; // Clear existing list items
    countries.forEach((country, index) => {
        const listItem = document.createElement('li');
        listItem.style.color = datasets[index].borderColor;
        listItem.style.cursor = 'pointer';
        listItem.style.fontSize = '1rem';
        listItem.style.margin = '0.5rem 0';
        listItem.textContent = country;

        // Add click event to toggle visibility on all charts
        listItem.addEventListener('click', () => {
            charts.forEach(chart => {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = !meta.hidden; // Toggle visibility
                chart.update();
            });

            // Update the text decoration to indicate hidden state
            listItem.style.textDecoration = meta.hidden ? 'line-through' : 'none';
        });

        countryList.appendChild(listItem);
    });
}

// Fetch and render the charts using the updated file structure
fetch('static2/data/migration_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const ctxNetMigration = document.getElementById('netMigrationChart').getContext('2d');
        const ctxTotalPopulation = document.getElementById('populationChart').getContext('2d');
        const ctxPopulationDensity = document.getElementById('populationDensityChart').getContext('2d');

        // Extract data for charts
        const labels = [...new Set(data.map(item => item.year))].sort((a, b) => a - b);
        const countries = [];
        const datasets = Object.entries(
            data.reduce((acc, item) => {
                if (!acc[item.country]) {
                    acc[item.country] = { years: [], netMigration: [], population: [], densities: [] };
                    countries.push(item.country);
                }
                acc[item.country].years.push(item.year);
                acc[item.country].netMigration.push(item.net_migration);
                acc[item.country].population.push(item.population); // Use `population` key
                acc[item.country].densities.push(item.pop_density);
                return acc;
            }, {})
        ).map(([country, details], index) => ({
            label: country,
            borderColor: getUniqueColor(index), // Assign unique color for each country
            netMigration: labels.map(year => {
                const yearIndex = details.years.indexOf(year);
                return yearIndex !== -1 ? details.netMigration[yearIndex] : null; // Handle missing data
            }),
            population: labels.map(year => {
                const yearIndex = details.years.indexOf(year);
                return yearIndex !== -1 ? details.population[yearIndex] : null; // Handle missing data
            }),
            densities: labels.map(year => {
                const yearIndex = details.years.indexOf(year);
                return yearIndex !== -1 ? details.densities[yearIndex] : null; // Handle missing data
            })
        }));

        // Create net migration chart
        const netMigrationChart = new Chart(ctxNetMigration, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(ds => ({
                    label: ds.label,
                    data: ds.netMigration,
                    borderColor: ds.borderColor,
                    fill: false,
                    tension: 0.1
                }))
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Net Migration (individuals)'
                        }
                    }
                }
            }
        });

        // Create total population chart
        const totalPopulationChart = new Chart(ctxTotalPopulation, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(ds => ({
                    label: ds.label,
                    data: ds.population, // Use `population` dataset
                    borderColor: ds.borderColor,
                    fill: false,
                    tension: 0.1
                }))
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total Population'
                        }
                    }
                }
            }
        });

        // Create population density chart
        const populationDensityChart = new Chart(ctxPopulationDensity, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(ds => ({
                    label: ds.label,
                    data: ds.densities,
                    borderColor: ds.borderColor,
                    fill: false,
                    tension: 0.1
                }))
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Population Density (per sq. km)'
                        }
                    }
                }
            }
        });

        // Populate the universal key with all charts
        populateUniversalCountryKey(countries, datasets, [netMigrationChart, totalPopulationChart, populationDensityChart]);
    })
    .catch(error => console.error('Error fetching or rendering data:', error));
    