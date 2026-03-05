import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
    month: number;
    year: number;
    revenue: number;
    orderCount: number;
}

interface RevenueChartProps {
    data: RevenueData[];
}

const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const formattedData = data.map(item => ({
        name: `${monthNames[item.month - 1]} ${item.year}`,
        revenue: item.revenue,
        orders: item.orderCount
    }));

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                Revenue Growth
                <span className="text-xs font-medium text-gray-400">Last 6 Months</span>
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={formattedData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
