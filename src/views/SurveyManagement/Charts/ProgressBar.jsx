import React from "react";
import { BarChart, Bar, Cell, ResponsiveContainer, LabelList } from "recharts";

const ProgressBar = (props) => {
    const { bgcolor, completed, max } = props;
    const data = [{ name: 'Completion', value: (completed / max) * 100 }];

    const containerStyles = {
        height: 25,
        width: '100%',  //'200px'
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        margin: 2
    }

    const fillerStyles = {
        // height: '100%',
        // width: `${(completed/max)*100}%`,
        // backgroundColor: bgcolor,
        // borderRadius: 'inherit',
        // textAlign: 'right'

        height: '100%',
        width: `${(completed / max) * 100}%`,
        backgroundColor: bgcolor,
        borderRadius: 'inherit'
    }

    const labelStyles = {
        padding: 5,
        color: 'white',
        fontWeight: 'bold'
    }

    return (
        <>
            <div style={containerStyles}>
                <div style={fillerStyles}>
                    <span style={labelStyles}>{`${completed}`}{max === 100 ? '%' : ''}</span>
                </div>
            </div>

            {/* <div style={{ height: '25px', width: '100%', backgroundColor: '#e0e0de', borderRadius: '50px', margin: '2px', textAlign: 'center' }}>
                <div style={{
                    height: '100%',
                    width: `${completed}%`,
                    backgroundColor: '#6a1b9a',
                    borderRadius: 'inherit',
                }}>
                    <span style={{ padding: '5px', color: 'white', fontWeight: 'bold' }}>{`${completed}%`}</span>
                </div>
            </div> */}

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
