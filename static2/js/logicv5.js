// Helper function to generate unique colors for each country
function getUniqueColor(index) {
    const colors = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
    return colors[index % colors.length];
}

// Fetch and render the line chart using the updated file structure
fetch('Resources/data_files/migration_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const ctx = document.getElementById('myLineChart').getContext('2d');

        // Extract data for the chart
        const labels = [...new Set(data.map(item => item.year))].sort((a, b) => a - b);
        const datasets = Object.entries(
            data.reduce((acc, item) => {
                if (!acc[item.country]) {
                    acc[item.country] = { years: [], values: [] };
                }
                acc[item.country].years.push(item.year);
                acc[item.country].values.push(item.net_migration);
                return acc;
            }, {})
        ).map(([country, details], index) => ({
            label: country,
            data: labels.map(year => {
                const yearIndex = details.years.indexOf(year);
                return yearIndex !== -1 ? details.values[yearIndex] : null; // Handle missing data
            }),
            fill: false,
            borderColor: getUniqueColor(index), // Assign unique color for each country
            tension: 0.1
        }));

        // Create the chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
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
                            text: 'Net Migration'
                        }
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching or rendering data:', error));
