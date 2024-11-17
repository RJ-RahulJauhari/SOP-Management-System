import React, { useState, useEffect } from 'react';
import { getAssessQuality, getAllSOPs } from '../../api';
import ViewSOP from './ViewSOP';
import ReactMarkdown from 'react-markdown';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const AssessQuality = () => {
  const [id, setId] = useState('');
  const [quality, setQuality] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  const [qualityData, setQualityData] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  const handleAssess = async () => {
    setLoading(true); // Show loader
    try {
      const response = await getAssessQuality(id);
      setQuality(response.data.qualityScore);
      setAnalysis(response.data.analysis);
      setError(null); // Clear previous errors
    } catch (error) {
      setQuality(null);
      setAnalysis(null);
      setError('Failed to fetch the quality score.');
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const fetchQualityScores = async () => {
    setLoading(true); // Show loader
    try {
      const response = await getAllSOPs();
      const low = response.data.filter((sop) => sop.qualityScore < 30).length;
      const medium = response.data.filter(
        (sop) => sop.qualityScore >= 30 && sop.qualityScore < 60
      ).length;
      const high = response.data.filter((sop) => sop.qualityScore >= 60).length;
      setQualityData({ low, medium, high });
    } catch (error) {
      console.error('Failed to fetch quality scores:', error);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  useEffect(() => {
    fetchQualityScores(); // Fetch the quality scores when the component mounts
  }, []);

  const data = {
    labels: ['Low Quality (<30)', 'Medium Quality (30-60)', 'High Quality (>60)'],
    datasets: [
      {
        label: 'Number of SOPs',
        data: [qualityData.low, qualityData.medium, qualityData.high],
        backgroundColor: ['#ff6384', '#ffcd56', '#36a2eb'],
        borderColor: ['#ff6384', '#ffcd56', '#36a2eb'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Assess Quality</h2>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="id"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Enter SOP ID
            </label>
            <input
              id="id"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block"
              type="text"
              placeholder="Enter SOP ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm"
            onClick={handleAssess}
          >
            Assess
          </button>
        </form>

        {/* Loader */}
        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="loader border-t-4 border-blue-700 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Response Section */}
            <div className="flex-1 bg-gray-100 p-4 rounded-md">
              {quality !== null && (
                <p className="mt-4 text-lg">
                  Quality Score: <span className="font-semibold">{quality}</span>
                </p>
              )}
              {analysis && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Analysis</h3>
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              )}
              {error && (
                <p className="mt-4 text-lg text-red-600">{error}</p>
              )}
            </div>

            {/* Quality Score Distribution Chart */}
            <div className="flex-1 bg-white p-4 shadow-md rounded-md">
              <h2 className="text-xl font-semibold mb-4">Quality Score Distribution</h2>
              <Bar data={data} options={options} />
            </div>
          </div>
        )}
      </div>

      <ViewSOP />
    </div>
  );
};

export default AssessQuality;
