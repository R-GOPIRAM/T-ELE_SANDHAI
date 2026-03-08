import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusData {
    status: string;
    count: number;
}

interface StatusBreakdownProps {
    data: StatusData[];
}

const COLORS = {
    Processing: '#F59E0B',
    Shipped: '#2563EB',
    Delivered: '#16A34A',
    Cancelled: '#DC2626',
};

const DEFAULT_COLOR = '#6B7280';

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ data }) => {
    return (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border h-[400px]">
            <h3 className="text-lg font-bold text-text-primary mb-6">Order Status</h3>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.status as keyof typeof COLORS] || DEFAULT_COLOR}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#FFFFFF'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-bold text-text-secondary">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
