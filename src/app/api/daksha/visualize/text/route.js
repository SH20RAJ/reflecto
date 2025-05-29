import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const { data, chartType, prompt } = await request.json();

        if (!data) {
            return NextResponse.json(
                { error: 'No data provided' },
                { status: 400 }
            );
        }

        // Try to parse data as JSON first, then CSV, then natural language
        let parsedData = null;
        let dataSource = 'unknown';

        try {
            // Try JSON first
            parsedData = JSON.parse(data);
            dataSource = 'json';
        } catch {
            try {
                // Try CSV format
                parsedData = parseCSVText(data);
                dataSource = 'csv';
                if (!parsedData || parsedData.length === 0) {
                    throw new Error('Invalid CSV');
                }
            } catch {
                // Use AI to interpret natural language data description
                const aiGeneratedData = await generateDataFromDescription(data, prompt);
                parsedData = aiGeneratedData;
                dataSource = 'ai-generated';
            }
        }

        if (!parsedData || parsedData.length === 0) {
            return NextResponse.json(
                { error: 'Could not parse or generate data from input' },
                { status: 400 }
            );
        }

        // Analyze data and generate insights
        const dataAnalysis = await analyzeDataWithAI(parsedData, prompt, dataSource);

        // Determine chart type
        const finalChartType = chartType === 'auto' ? dataAnalysis.recommendedChart : chartType;

        // Generate chart configuration
        const chartConfig = generateChartConfig(parsedData, finalChartType, dataAnalysis);

        return NextResponse.json({
            chartConfig: chartConfig,
            chartType: finalChartType,
            insights: dataAnalysis.insights,
            summary: dataAnalysis.summary,
            dataPreview: parsedData.slice(0, 5),
            totalRows: parsedData.length,
            dataSource: dataSource,
            metadata: dataAnalysis.metadata || {
                timestamp: new Date().toISOString(),
                isDemoMode: false
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Text visualization API error:', error);
        return NextResponse.json(
            { error: 'Failed to process text data', details: error.message },
            { status: 500 }
        );
    }
}

// Parse CSV text data
function parseCSVText(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        if (values.length !== headers.length) continue;

        const row = {};
        headers.forEach((header, index) => {
            let value = values[index] || '';
            // Try to parse as number if it looks like one
            if (!isNaN(value) && value !== '') {
                value = parseFloat(value);
            }
            row[header] = value;
        });
        data.push(row);
    }

    return data;
}

// Generate data from natural language description using AI
async function generateDataFromDescription(description, prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are Daksha, an AI assistant that can generate sample datasets based on descriptions. Generate realistic, structured data in JSON format."
                },
                {
                    role: "user",
                    content: `Generate a sample dataset based on this description: "${description}"

Additional context: "${prompt}"

Please return a JSON array of objects representing the data. Make it realistic and useful for visualization. Include 10-20 data points.

Example format:
[
  {"category": "A", "value": 25, "date": "2024-01"},
  {"category": "B", "value": 30, "date": "2024-01"}
]

Return only the JSON array, no explanation.`
                }
            ],
            max_tokens: 1000,
            temperature: 0.3,
        });

        const jsonText = response.choices[0].message.content.trim();
        // Extract JSON from the response
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            return JSON.parse(jsonText);
        }
    } catch (openaiError) {
        console.log('OpenAI API unavailable, using fallback data generation:', openaiError.message);

        // Enhanced fallback data generation based on description
        const lowerDesc = description.toLowerCase();
        let fallbackData = [];

        if (lowerDesc.includes('sales') || lowerDesc.includes('revenue')) {
            fallbackData = [
                { month: 'Jan', sales: 12000, revenue: 15000, target: 14000 },
                { month: 'Feb', sales: 15000, revenue: 18000, target: 16000 },
                { month: 'Mar', sales: 18000, revenue: 22000, target: 18000 },
                { month: 'Apr', sales: 22000, revenue: 26000, target: 20000 },
                { month: 'May', sales: 19000, revenue: 23000, target: 22000 },
                { month: 'Jun', sales: 25000, revenue: 30000, target: 24000 }
            ];
        } else if (lowerDesc.includes('user') || lowerDesc.includes('traffic')) {
            fallbackData = [
                { source: 'Direct', users: 2500, sessions: 3200, bounceRate: 0.25 },
                { source: 'Search', users: 4200, sessions: 5100, bounceRate: 0.18 },
                { source: 'Social', users: 1800, sessions: 2400, bounceRate: 0.35 },
                { source: 'Email', users: 1200, sessions: 1600, bounceRate: 0.15 },
                { source: 'Referral', users: 900, sessions: 1200, bounceRate: 0.22 }
            ];
        } else if (lowerDesc.includes('product') || lowerDesc.includes('category')) {
            fallbackData = [
                { product: 'Product A', units: 150, price: 29.99, rating: 4.5 },
                { product: 'Product B', units: 220, price: 49.99, rating: 4.2 },
                { product: 'Product C', units: 180, price: 39.99, rating: 4.7 },
                { product: 'Product D', units: 90, price: 79.99, rating: 4.0 },
                { product: 'Product E', units: 320, price: 19.99, rating: 4.8 }
            ];
        } else if (lowerDesc.includes('temperature') || lowerDesc.includes('weather')) {
            fallbackData = [
                { city: 'New York', temperature: 22, humidity: 65, rainfall: 2.5 },
                { city: 'Los Angeles', temperature: 28, humidity: 45, rainfall: 0.1 },
                { city: 'Chicago', temperature: 18, humidity: 70, rainfall: 3.2 },
                { city: 'Miami', temperature: 32, humidity: 85, rainfall: 5.8 },
                { city: 'Seattle', temperature: 16, humidity: 80, rainfall: 8.5 }
            ];
        } else {
            // Generic fallback data
            fallbackData = [
                { category: 'Category A', value: 25, percentage: 20 },
                { category: 'Category B', value: 35, percentage: 28 },
                { category: 'Category C', value: 20, percentage: 16 },
                { category: 'Category D', value: 40, percentage: 32 },
                { category: 'Category E', value: 5, percentage: 4 }
            ];
        }

        return fallbackData;
    }
}

// Analyze data using AI
async function analyzeDataWithAI(data, userPrompt, dataSource) {
    if (!data || data.length === 0) {
        return {
            insights: "No data available for analysis.",
            summary: "Empty dataset",
            recommendedChart: "bar"
        };
    }

    const sample = data.slice(0, 3);
    const columns = Object.keys(data[0] || {});
    const dataTypes = analyzeDataTypes(data);

    const prompt = `Analyze this dataset and provide insights:

Dataset Source: ${dataSource}
- Columns: ${columns.join(', ')}
- Total rows: ${data.length}
- Data types: ${JSON.stringify(dataTypes)}
- Sample data: ${JSON.stringify(sample, null, 2)}

User request: "${userPrompt}"

Please provide:
1. A comprehensive summary of the dataset
2. Key insights, patterns, and trends
3. Recommended chart type (bar, line, pie, scatter, area)
4. Notable observations and correlations
5. Suggestions for further analysis

Be thorough and provide actionable insights.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are Daksha, an AI with advanced data analysis capabilities. Provide detailed, insightful analysis of datasets."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1200,
            temperature: 0.3,
        });

        const analysis = response.choices[0].message.content;

        // Extract recommended chart type
        const chartTypeMatch = analysis.toLowerCase().match(/(bar|line|pie|scatter|area)/);
        const recommendedChart = chartTypeMatch ? chartTypeMatch[1] : determineChartType(data);

        return {
            insights: analysis,
            summary: `Dataset with ${data.length} rows and ${columns.length} columns`,
            recommendedChart: recommendedChart
        };
    } catch (openaiError) {
        console.log('OpenAI API unavailable, using fallback text data analysis:', openaiError.message);

        // Enhanced fallback analysis for text-based data
        const numericCols = columns.filter(col => dataTypes[col] === 'numeric');
        const categoricalCols = columns.filter(col => dataTypes[col] === 'categorical');
        const recommendedChart = determineChartType(data);

        let insights = [];
        let summary = `Text Data Analysis (Demo Mode)\n\nI've processed your ${dataSource} data containing ${data.length} rows and ${columns.length} columns.`;

        // Analyze data source
        if (dataSource === 'ai-generated') {
            insights.push('📊 Data generated from natural language description using AI interpretation');
        } else if (dataSource === 'csv') {
            insights.push('📄 Data parsed from CSV text format');
        } else if (dataSource === 'json') {
            insights.push('🔗 Data parsed from JSON text format');
        }

        // Column analysis
        if (numericCols.length > 0) {
            insights.push(`🔢 Numeric analysis available for: ${numericCols.join(', ')}`);

            // Calculate statistics for numeric columns
            numericCols.slice(0, 2).forEach(col => {
                const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
                if (values.length > 0) {
                    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
                    insights.push(`  • ${col}: ${min}-${max} range, avg ${avg}, trend ${trend}`);
                }
            });
        }

        if (categoricalCols.length > 0) {
            insights.push(`📋 Categorical breakdown for: ${categoricalCols.join(', ')}`);

            // Analyze categorical distribution
            categoricalCols.slice(0, 2).forEach(col => {
                const uniqueValues = [...new Set(data.map(row => row[col]))];
                const mostCommon = data.reduce((acc, row) => {
                    acc[row[col]] = (acc[row[col]] || 0) + 1;
                    return acc;
                }, {});
                const topCategory = Object.keys(mostCommon).reduce((a, b) => mostCommon[a] > mostCommon[b] ? a : b);
                insights.push(`  • ${col}: ${uniqueValues.length} categories, "${topCategory}" most frequent`);
            });
        }

        // Data completeness
        const completeness = calculateDataCompleteness(data);
        insights.push(`✅ Data completeness: ${(completeness * 100).toFixed(1)}%`);

        // Visualization recommendation
        let vizInsight = '';
        switch (recommendedChart) {
            case 'bar':
                vizInsight = '📊 Bar chart recommended for clear category comparisons';
                break;
            case 'line':
                vizInsight = '📈 Line chart ideal for showing trends over time or sequence';
                break;
            case 'pie':
                vizInsight = '🥧 Pie chart suitable for showing proportional relationships';
                break;
            case 'scatter':
                vizInsight = '🔍 Scatter plot perfect for correlation analysis between variables';
                break;
            case 'area':
                vizInsight = '📊 Area chart effective for cumulative data visualization';
                break;
            default:
                vizInsight = '📊 Chart type optimized for your data structure';
        }
        insights.push(vizInsight);

        // User prompt consideration
        if (userPrompt && userPrompt.trim()) {
            insights.push(`🎯 Analysis focused on: "${userPrompt}"`);
        }

        const fallbackAnalysis = `${summary}\n\n**Key Insights:**\n${insights.map(insight => `${insight}`).join('\n')}\n\n**Visualization Recommendation:** ${recommendedChart.charAt(0).toUpperCase() + recommendedChart.slice(1)} chart\n\n**Demo Mode Notice:**\nIn full operation mode, Daksha would provide:\n• Advanced statistical analysis and correlation detection\n• Time series analysis and forecasting\n• Anomaly detection and pattern recognition\n• Custom insights based on domain expertise\n• Interactive drill-down recommendations\n• Automated report generation\n\nThis demonstrates Daksha's comprehensive text data analysis capabilities.`;

        return {
            insights: fallbackAnalysis,
            summary: `Text dataset with ${data.length} rows and ${columns.length} columns (Demo Mode)`,
            recommendedChart: recommendedChart,
            metadata: {
                model: 'fallback-text-analyzer',
                timestamp: new Date().toISOString(),
                isDemoMode: true,
                dataSource: dataSource,
                dataStructure: {
                    numericColumns: numericCols,
                    categoricalColumns: categoricalCols,
                    dataTypes: dataTypes,
                    completeness: completeness
                }
            }
        };
    }
}

// Analyze data types
function analyzeDataTypes(data) {
    if (!data || data.length === 0) return {};

    const types = {};
    const columns = Object.keys(data[0]);

    columns.forEach(col => {
        const values = data.slice(0, 10).map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
        const numValues = values.filter(v => !isNaN(v) && v !== '').length;
        types[col] = numValues > values.length * 0.7 ? 'numeric' : 'categorical';
    });

    return types;
}

// Calculate data completeness
function calculateDataCompleteness(data) {
    if (!data || data.length === 0) return 0;

    const totalCells = data.length * Object.keys(data[0]).length;
    let filledCells = 0;

    data.forEach(row => {
        Object.values(row).forEach(value => {
            if (value !== null && value !== undefined && value !== '') {
                filledCells++;
            }
        });
    });

    return filledCells / totalCells;
}

// Determine best chart type
function determineChartType(data) {
    if (!data || data.length === 0) return 'bar';

    const columns = Object.keys(data[0]);
    const types = analyzeDataTypes(data);
    const numericCols = Object.keys(types).filter(col => types[col] === 'numeric');

    if (numericCols.length >= 2) return 'scatter';
    if (data.length > 20) return 'line';
    if (data.length <= 8) return 'pie';
    return 'bar';
}

// Generate Chart.js configuration
function generateChartConfig(data, chartType, analysis) {
    if (!data || data.length === 0) {
        return {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {}
        };
    }

    const columns = Object.keys(data[0]);
    const types = analyzeDataTypes(data);

    // Smart column selection
    const categoricalCols = columns.filter(col => types[col] === 'categorical');
    const numericCols = columns.filter(col => types[col] === 'numeric');

    const xColumn = categoricalCols[0] || columns[0];
    const yColumn = numericCols[0] || columns[1] || columns[0];

    const labels = data.map(row => String(row[xColumn] || ''));
    const values = data.map(row => {
        const val = parseFloat(row[yColumn]);
        return isNaN(val) ? 0 : val;
    });

    // Daksha color scheme
    const colors = [
        'rgba(123, 31, 162, 0.8)',
        'rgba(142, 36, 170, 0.8)',
        'rgba(155, 39, 176, 0.8)',
        'rgba(171, 71, 188, 0.8)',
        'rgba(186, 104, 200, 0.8)',
        'rgba(206, 147, 216, 0.8)',
        'rgba(225, 190, 231, 0.8)',
    ];

    let config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: yColumn,
                data: values,
                backgroundColor: chartType === 'pie' ? colors.slice(0, Math.min(data.length, colors.length)) : colors[0],
                borderColor: chartType === 'pie' ? colors.slice(0, Math.min(data.length, colors.length)).map(c => c.replace('0.8', '1')) : 'rgba(123, 31, 162, 1)',
                borderWidth: 2,
                tension: chartType === 'line' ? 0.4 : 0,
                fill: chartType === 'area',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${yColumn} by ${xColumn}`,
                    color: '#ffffff',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(123, 31, 162, 1)',
                    borderWidth: 1
                }
            },
            scales: chartType !== 'pie' ? {
                x: {
                    ticks: {
                        color: '#ffffff',
                        maxRotation: 45,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    },
                    title: {
                        display: true,
                        text: xColumn,
                        color: '#ffffff',
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    },
                    title: {
                        display: true,
                        text: yColumn,
                        color: '#ffffff',
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                }
            } : {},
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };

    return config;
}
