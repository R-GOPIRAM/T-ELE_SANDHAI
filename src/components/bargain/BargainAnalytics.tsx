import { useState, useEffect } from 'react';
import { BarChart, Activity, PieChart, DollarSign } from 'lucide-react';
import { bargainService } from '../../services/bargainService';

export default function BargainAnalytics() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await bargainService.getAnalytics();
                setStats(data.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading analytics...</div>;
    if (!stats) return <div>No data available</div>;

    const acceptanceRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Total Negotiations</h3>
                    <Activity className="text-blue-500 w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-green-600 mt-1">Active Interactions</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-green-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Bargain Revenue</h3>
                    <DollarSign className="text-green-500 w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
                <p className="text-xs text-gray-500 mt-1">From accepted deals</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Acceptance Rate</h3>
                    <PieChart className="text-purple-500 w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">{acceptanceRate}%</div>
                <p className="text-xs text-gray-500 mt-1">{stats.accepted} accepted / {stats.rejected} rejected</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Expired/Ignored</h3>
                    <BarChart className="text-orange-500 w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">{stats.expired}</div>
                <p className="text-xs text-red-500 mt-1">Deals lost</p>
            </div>
        </div>
    );
}
