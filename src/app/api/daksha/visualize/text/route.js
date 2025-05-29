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
                    content: `Analyze this dataset and provide insights:

Dataset Source: ${dataSource}
- Columns: ${columns.join(', ')}
- Total rows: ${data.length}
- Data types: ${JSON.stringify(dataTypes)}
- Sample data: ${JSON.stringify(sample, null, 2)}

User request: "${userPrompt}"

Please provide comprehensive analysis and recommend chart type (bar, line, pie, scatter, area).`
                }
            ],
            max_tokens: 1200,
            temperature: 0.3,
        });

        const analysis = response.choices[0].message.content;
        const chartTypeMatch = analysis.toLowerCase().match(/(bar|line|pie|scatter|area)/);
        const recommendedChart = chartTypeMatch ? chartTypeMatch[1] : determineChartType(data);

        return {
            insights: analysis,
            summary: `Dataset with ${data.length} rows and ${columns.length} columns`,
            recommendedChart: recommendedChart
        };
    } catch (openaiError) {
        console.log('OpenAI API unavailable, using fallback analysis:', openaiError.message);
        
        const numericCols = columns.filter(col => dataTypes[col] === 'numeric');
        const categoricalCols = columns.filter(col => dataTypes[col] === 'categorical');
        const recommendedChart = determineChartType(data);
        
        let insights = [];
        let summary = `Text Data Analysis (Demo Mode)\n\nProcessed ${dataSource} data with ${data.length} rows and ${columns.length} columns.`;
        
        if (dataSource === 'csv') {
            insights.push('📄 Data parsed from CSV text format');
        } else if (dataSource === 'json') {
            insights.push('🔗 Data parsed from JSON text format');
        } else if (dataSource === 'ai-generated') {
            insights.push('📊 Data generated from natural language description');
        }
        
        if (numericCols.length > 0) {
            insights.push(`🔢 Numeric columns: ${numericCols.join(', ')}`);
            
            numericCols.slice(0, 2).forEach(col => {
                const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
                if (values.length > 0) {
                    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    insights.push(`  • ${col}: ${min}-${max} range, avg ${avg}`);
                }
            });
        }
        
        if (categoricalCols.length > 0) {
            insights.push(`📋 Categorical columns: ${categoricalCols.join(', ')}`);
        }
        
        insights.push(`📊 Recommended visualization: ${recommendedChart} chart`);
        
        if (userPrompt && userPrompt.trim()) {
            insights.push(`🎯 Focus: "${userPrompt}"`);
        }
        
        const fallbackAnalysis = `${summary}\n\n**Key Insights:**\n${insights.map(insight => `${insight}`).join('\n')}\n\n**Demo Mode:** This shows Daksha's text analysis capabilities with enhanced fallback processing.`;
        
        return {
            insights: fallbackAnalysis,
            summary: `Text dataset with ${data.length} rows, ${columns.length} columns (Demo Mode)`,
            recommendedChart: recommendedChart,
            metadata: {
                model: 'fallback-text-analyzer',
                timestamp: new Date().toISOString(),
                isDemoMode: true,
                dataSource: dataSource
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
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: chartType !== 'pie' ? {
                x: {
                    ticks: { 
                        color: '#ffffff',
                        maxRotation: 45
                    },
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: { 
                        color: '#ffffff'
                    },
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            } : {}
        }
    };

    return config;
}
