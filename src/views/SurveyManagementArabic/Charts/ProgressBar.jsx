import React from "react";
import { BarChart, Bar, Cell, ResponsiveContainer, LabelList } from "recharts";

import './Charts.scss';

const ProgressBar = (props) => {
    const { completed, max } = props;
    const progress = (completed / max) * 100;

    const data = [{ name: 'Completion', value: (completed / max) * 100 }];

    return (
        <>
            <div className="progress-bar-container-styles">
                <div className="progress-bar-filler-styles" style={{ width: `${progress}%`}}>
                    
                </div>
                <span className="progress-bar-label-styles">{`${completed}`}{max === 100 ? '%' : ''}</span>
            </div>

            {/* <ResponsiveContainer width={`${completed}%`} height={35}>
                <BarChart data={data} layout="horizontal" barCategoryGap="0%">
                    <Bar dataKey="value" fill={bgcolor}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="center"
                            formatter={(value) => `${value.toFixed(1)}%`}  // Display the value with a percentage sign
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer> */}
        </>
    );
};

export default ProgressBar;
