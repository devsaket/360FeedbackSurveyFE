import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const RadarGraph = ({ radarChartData, categoryTraitData }) => {
    const COLORS = ['#f1c40f', '#7f8c8d', "#8884d8"];
    console.log(radarChartData);

    const radarChartData1 = radarChartData.map(({ trait, Self }) => ({ trait, Self }));

    const radarChartData2 = radarChartData.map(({ trait, ...rest }) => rest);

    return (
        <>
        <div style={{ width: '100%' }} className='d-flex align-items-center justify-content-center my-5'>
            <div className="text-center px-3">
                <h2>For Self</h2>
                <RadarChart outerRadius={150} width={450} height={450} data={radarChartData}>
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis angle={30} domain={[0, 7]} />
                    <Radar name="Self" dataKey="Self" stroke="#aaaaaa" fill="#aaaaaa" fillOpacity={0.6} />
                    <Legend />
                </RadarChart>
            </div>

            <div className="text-center px-3">
                <h2>For Others</h2>
                <RadarChart outerRadius={150} width={450} height={450}  data={radarChartData}>
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis angle={30} domain={[0, 7]} />
                    {categoryTraitData.map((item, index) => (
                        item.category === "Self"?"":
                            <Radar key={index} name={item.category} dataKey={item.category} stroke={COLORS[index]} fill={COLORS[index]} fillOpacity={0.6} />
                        
                    ))}
                    <Legend />
                </RadarChart>
            </div>
            <div className='text-center px-3'>
                <h3>Total Summary</h3>
                <RadarChart outerRadius={150} width={450} height={450} data={radarChartData}>
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis angle={30} domain={[0, 7]} />
                    {categoryTraitData.map((item, index) => (
                        <Radar key={index} name={item.category} dataKey={item.category} stroke={COLORS[index]} fill={COLORS[index]} fillOpacity={0.6} />
                    ))}
                    <Legend />
                </RadarChart>
            </div>

        </div>
        
        </>
    );
};

export default RadarGraph;
