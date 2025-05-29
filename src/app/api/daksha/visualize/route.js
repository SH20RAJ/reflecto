import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const chartType = formData.get('chartType') || 'auto';
        const prompt = formData.get('prompt') || '';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const fileType = file.type;
        let data = null;
        let parsedData = null;

        // Parse different file types
        if (fileType.includes('csv') || fileType.includes('text/plain')) {
            const text = await file.text();
            parsedData = parseCSV(text);
        } else if (fileType.includes('json')) {
            const text = await file.text();
            try {
                parsedData = JSON.parse(text);
            } catch (error) {
                return NextResponse.json(
                    { error: 'Invalid JSON format' },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload CSV or JSON files.' },
                { status: 400 }
            );
        }

        // Analyze data structure and generate insights using AI
        const dataAnalysis = await analyzeDataWithAI(parsedData, prompt);

        // Determine the best chart type if auto
        const finalChartType = chartType === 'auto' ? dataAnalysis.recommendedChart : chartType;

        // Generate chart configuration
        const chartConfig = generateChartConfig(parsedData, finalChartType, dataAnalysis);

        return NextResponse.json({
            chartConfig: chartConfig,
            chartType: finalChartType,
            insights: dataAnalysis.insights,
            summary: dataAnalysis.summary,
            dataPreview: parsedData.slice(0, 5), // First 5 rows for preview
            totalRows: parsedData.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Daksha visualize API error:', error);
        return NextResponse.json(
            { error: 'Failed to process visualization' },
            { status: 500 }
        );
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }

    return data;
}

// Analyze data using AI
async function analyzeDataWithAI(data, userPrompt) {
    if (!data || data.length === 0) {
        return {
            insights: "No data available for analysis.",
            summary: "Empty dataset",
            recommendedChart: "bar"
        };
    }

    // Get data sample and structure
    const sample = data.slice(0, 3);
    const columns = Object.keys(data[0] || {});
    const dataTypes = analyzeDataTypes(data);

    const prompt = `Analyze this dataset and provide insights:

Dataset Info:
- Columns: ${columns.join(', ')}
- Total rows: ${data.length}
- Data types: ${JSON.stringify(dataTypes)}
- Sample data: ${JSON.stringify(sample, null, 2)}

User request: "${userPrompt}"

Please provide:
1. A summary of the dataset
2. Key insights and patterns
3. Recommended chart type (bar, line, pie, scatter, area)
4. Interesting observations

Be thorough and analytical like Daksha would be.`;

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
            max_tokens: 1000,
            temperature: 0.3,
        });

        const analysis = response.choices[0].message.content;

        // Extract recommended chart type from response
        const chartTypeMatch = analysis.toLowerCase().match(/(bar|line|pie|scatter|area)/);
        const recommendedChart = chartTypeMatch ? chartTypeMatch[1] : determineChartType(data);

        return {
            insights: analysis,
            summary: `Dataset with ${data.length} rows and ${columns.length} columns`,
            recommendedChart: recommendedChart
        };
    } catch (openaiError) {
        console.log('OpenAI API unavailable, using fallback data analysis:', openaiError.message);

        // Enhanced fallback analysis
        const numericCols = columns.filter(col => dataTypes[col] === 'numeric');
        const categoricalCols = columns.filter(col => dataTypes[col] === 'categorical');
        const recommendedChart = determineChartType(data);

        // Generate intelligent insights based on data structure
        let insights = [];
        let summary = `Dataset Analysis (Demo Mode)\n\nI've analyzed your dataset containing ${data.length} rows and ${columns.length} columns.`;

        // Analyze data structure
        if (numericCols.length > 0) {
            insights.push(`Found ${numericCols.length} numeric column(s): ${numericCols.join(', ')}`);

            // Calculate basic statistics for numeric columns
            numericCols.forEach(col => {
                const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
                if (values.length > 0) {
                    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    insights.push(`${col}: Range ${min}-${max}, Average ${avg}`);
                }
            });
        }

        if (categoricalCols.length > 0) {
            insights.push(`Found ${categoricalCols.length} categorical column(s): ${categoricalCols.join(', ')}`);

            // Analyze categorical data
            categoricalCols.forEach(col => {
                const uniqueValues = [...new Set(data.map(row => row[col]))];
                insights.push(`${col}: ${uniqueValues.length} unique values`);
            });
        }

        // Recommend visualization approach
        let vizRecommendation = '';
        if (data.length > 50) {
            vizRecommendation = 'Large dataset suitable for trend analysis and aggregated views.';
        } else if (data.length > 20) {
            vizRecommendation = 'Medium dataset ideal for detailed comparisons and patterns.';
        } else {
            vizRecommendation = 'Small dataset perfect for individual item analysis.';
        }

        insights.push(vizRecommendation);

        // User prompt consideration
        if (userPrompt && userPrompt.trim()) {
            insights.push(`User focus: "${userPrompt}" - analysis would be customized accordingly.`);
        }

        const fallbackAnalysis = `${summary}\n\n**Key Insights:**\n${insights.map(insight => `• ${insight}`).join('\n')}\n\n**Recommended Visualization:** ${recommendedChart.charAt(0).toUpperCase() + recommendedChart.slice(1)} chart\n\nIn full operation mode, Daksha would provide:\n• Advanced statistical analysis\n• Pattern recognition and trend identification\n• Correlation analysis between variables\n• Outlier detection and data quality assessment\n• Predictive insights and forecasting\n• Customized recommendations based on your specific needs\n\nThis demonstrates Daksha's comprehensive data analysis capabilities.`;

        return {
            insights: fallbackAnalysis,
            summary: `Dataset with ${data.length} rows and ${columns.length} columns (Demo Mode)`,
            recommendedChart: recommendedChart,
            metadata: {
                model: 'fallback-data-analyzer',
                timestamp: new Date().toISOString(),
                isDemoMode: true,
                dataStructure: {
                    numericColumns: numericCols,
                    categoricalColumns: categoricalCols,
                    dataTypes: dataTypes
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
        const values = data.slice(0, 10).map(row => row[col]);
        const numValues = values.filter(v => !isNaN(v) && v !== '').length;
        types[col] = numValues > values.length * 0.7 ? 'numeric' : 'categorical';
    });

    return types;
}

// Determine best chart type based on data
function determineChartType(data) {
    if (!data || data.length === 0) return 'bar';

    const columns = Object.keys(data[0]);
    const types = analyzeDataTypes(data);
    const numericCols = Object.keys(types).filter(col => types[col] === 'numeric');

    if (numericCols.length >= 2) return 'scatter';
    if (data.length > 20) return 'line';
    if (data.length <= 10) return 'pie';
    return 'bar';
}

// Generate chart configuration for Chart.js
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

    // Find best columns for x and y axes
    const categoricalCols = columns.filter(col => types[col] === 'categorical');
    const numericCols = columns.filter(col => types[col] === 'numeric');

    const xColumn = categoricalCols[0] || columns[0];
    const yColumn = numericCols[0] || columns[1] || columns[0];

    const labels = data.map(row => row[xColumn]);
    const values = data.map(row => {
        const val = parseFloat(row[yColumn]);
        return isNaN(val) ? 0 : val;
    });

    // Color scheme for Daksha
    const colors = [
        'rgba(123, 31, 162, 0.8)',
        'rgba(142, 36, 170, 0.8)',
        'rgba(155, 39, 176, 0.8)',
        'rgba(171, 71, 188, 0.8)',
        'rgba(186, 104, 200, 0.8)',
    ];

    let config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: yColumn,
                data: values,
                backgroundColor: colors[0],
                borderColor: 'rgba(123, 31, 162, 1)',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${yColumn} by ${xColumn}`,
                    color: '#ffffff'
                },
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: chartType !== 'pie' ? {
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            } : {}
        }
    };

    return config;
}
