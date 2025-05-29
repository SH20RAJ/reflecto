import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export function DakshaVisualize() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [data, setData] = useState('');
    const [prompt, setPrompt] = useState('');
    const [chartType, setChartType] = useState('auto');
    const [selectedFile, setSelectedFile] = useState(null);
    const [visualizationResult, setVisualizationResult] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const processCsvData = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('chartType', chartType);
        formData.append('prompt', prompt);

        try {
            const response = await fetch('/api/daksha/visualize', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setVisualizationResult(result);
            } else {
                console.error('Visualization error:', result.error);
                // Show error to user
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const processTextData = async () => {
        if (!data.trim()) return;

        setIsProcessing(true);

        try {
            const response = await fetch('/api/daksha/visualize/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: data,
                    chartType: chartType,
                    prompt: prompt
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setVisualizationResult(result);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderChart = () => {
        if (!visualizationResult?.chartConfig) return null;

        const { chartConfig } = visualizationResult;
        const chartProps = {
            data: chartConfig.data,
            options: {
                ...chartConfig.options,
                responsive: true,
                maintainAspectRatio: false,
            }
        };

        switch (chartConfig.type) {
            case 'bar':
                return <Bar {...chartProps} />;
            case 'line':
                return <Line {...chartProps} />;
            case 'pie':
                return <Pie {...chartProps} />;
            case 'scatter':
                return <Scatter {...chartProps} />;
            default:
                return <Bar {...chartProps} />;
        }
    };

    return (
        <div className="p-6">
            <Tabs defaultValue="csv">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="csv">Import CSV</TabsTrigger>
                    <TabsTrigger value="text">Enter Data</TabsTrigger>
                </TabsList>

                <TabsContent value="csv" className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Import Data from CSV/Excel</h2>
                        <Input
                            type="file"
                            accept=".csv,.xlsx,.json"
                            onChange={handleFileUpload}
                            className="mb-4"
                        />

                        {selectedFile && (
                            <>
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Chart Type
                                        </label>
                                        <Select
                                            value={chartType}
                                            onValueChange={(value) => setChartType(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select chart type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bar">Bar Chart</SelectItem>
                                                <SelectItem value="line">Line Chart</SelectItem>
                                                <SelectItem value="pie">Pie Chart</SelectItem>
                                                <SelectItem value="scatter">Scatter Plot</SelectItem>
                                                <SelectItem value="auto">Auto (AI Recommended)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Instructions (Optional)
                                        </label>
                                        <Textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="E.g., 'Show trends over time', 'Compare categories', etc."
                                            className="mb-4"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={processCsvData}
                                    disabled={!selectedFile || isProcessing}
                                    className="w-full"
                                >
                                    {isProcessing ? 'Processing...' : 'Generate Visualization'}
                                </Button>
                            </>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Enter Data Manually</h2>
                        <Textarea
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            placeholder="Enter data (JSON, CSV format, or natural language description)"
                            className="mb-4 min-h-[200px]"
                        />

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Chart Type
                                </label>
                                <Select
                                    value={chartType}
                                    onValueChange={(value) => setChartType(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select chart type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bar">Bar Chart</SelectItem>
                                        <SelectItem value="line">Line Chart</SelectItem>
                                        <SelectItem value="pie">Pie Chart</SelectItem>
                                        <SelectItem value="scatter">Scatter Plot</SelectItem>
                                        <SelectItem value="auto">Auto (AI Recommended)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Instructions (Optional)
                                </label>
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="E.g., 'Show trends over time', 'Compare categories', etc."
                                    className="mb-4"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={processTextData}
                            disabled={!data || isProcessing}
                            className="w-full"
                        >
                            {isProcessing ? 'Processing...' : 'Generate Visualization'}
                        </Button>
                    </Card>
                </TabsContent>
            </Tabs>

            {visualizationResult && (
                <div className="mt-8 space-y-6">
                    {/* Chart Display */}
                    {visualizationResult.chartConfig && (
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Data Visualization</h3>
                                <div className="flex gap-2">
                                    <Badge variant="secondary">
                                        {visualizationResult.chartType.toUpperCase()} Chart
                                    </Badge>
                                    <Badge variant="outline">
                                        {visualizationResult.totalRows} rows
                                    </Badge>
                                </div>
                            </div>

                            <div className="w-full h-96 mb-4">
                                {renderChart()}
                            </div>

                            <Button variant="outline" className="w-full">
                                Download Chart
                            </Button>
                        </Card>
                    )}

                    {/* Data Preview */}
                    {visualizationResult.dataPreview && (
                        <Card className="p-6">
                            <h4 className="text-lg font-semibold mb-3">Data Preview</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            {Object.keys(visualizationResult.dataPreview[0] || {}).map(key => (
                                                <th key={key} className="text-left p-2 font-medium">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visualizationResult.dataPreview.slice(0, 5).map((row, idx) => (
                                            <tr key={idx} className="border-b border-gray-800">
                                                {Object.values(row).map((value, cellIdx) => (
                                                    <td key={cellIdx} className="p-2">
                                                        {String(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* AI Insights */}
                    {visualizationResult.insights && (
                        <Card className="p-6">
                            <h4 className="text-lg font-semibold mb-3">✨ Daksha's Analysis</h4>
                            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/30">
                                <div className="whitespace-pre-wrap text-gray-200">
                                    {visualizationResult.insights}
                                </div>
                            </div>

                            {visualizationResult.summary && (
                                <div className="mt-3 text-sm text-gray-400">
                                    Summary: {visualizationResult.summary}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
