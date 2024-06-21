import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';

const SimpleDonutChart = ({ data }) => {
    const COLORS = ['#f1c40f', '#7f8c8d'];

    const chartData = [
        { name: 'Average Score', value: parseFloat(data) },
        { name: 'Remaining', value: (7 - parseFloat(data))     }
    ];

    return (
        <div style={{ width: '100%', height: 100 }} className='d-flex align-items-center justify-content-start'>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={40} fill="#8884d8" paddingAngle={0}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}

                        <Label value={data} position="center" fill="#000" style={{ fontSize: '24px', fontWeight: 'bold' }} />
                    </Pie>
                    {/* <Tooltip /> */}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SimpleDonutChart;
