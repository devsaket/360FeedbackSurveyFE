import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap, Cell } from 'recharts';

// Custom cell component for the Treemap
const CustomTreemapCell = ({ x, y, width, height, name, value }) => {
    const fillColor = value > 5 ? '#82ca9d' : '#ff6f61'; // Change colors based on value
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fillColor} />
            <text x={x + 5} y={y + 20} fill="#fff">{name} ({value})</text>
        </g>
    );
};

// Customize Tooltip
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p>{`${payload[0].name}`}</p>
                <p>{`Average Response: ${payload[0].value.toFixed(1)}`}</p>
            </div>
        );
    }
    return null;
};

// Customize labels for Treemap
const CustomizedLabel = ({ x, y, width, height, value }) => {
    return (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#ff6f61">
            {value}
        </text>
    );
};

const SurveyTopBottom5QuestionsForSelf = ({ subjectObject, questionObjects }) => {

    const getTopAndBottomSelfQuestions = (subject) => {
        const responses = subject.responses.filter(response => response.answer > 0); // Filter out responses with 0
        const sortedResponses = responses.map(response => {
            const question = questionObjects.find(q => q._id === response.questionId);
            return {
                questionText: question ? question.question : '',
                response: parseInt(response.answer, 10)
            };
        }).sort((a, b) => b.response - a.response);

        const topQuestions = sortedResponses.slice(0, 3);
        const bottomQuestions = sortedResponses.reverse().slice(0, 3);

        return { topQuestions, bottomQuestions };
    };

    const subject = subjectObject.length ? subjectObject[0] : null;
    const subjectQuestions = subject ? getTopAndBottomSelfQuestions(subject) : { topQuestions: [], bottomQuestions: [] };


    const processQuestionsForTreemap = (topQuestions, bottomQuestions) => {
        const data = [
            {
                name: 'Top Questions',
                children: topQuestions.map(question => ({
                    name: question.questionText,
                    value: question.response,
                })),
            },
            {
                name: 'Bottom Questions',
                children: bottomQuestions.map(question => ({
                    name: question.questionText,
                    value: question.response,
                })),
            },
        ];
        return data;
    };

    const treemapData = processQuestionsForTreemap(subjectQuestions.topQuestions, subjectQuestions.bottomQuestions);

    return (
        <>
            <h2>Top Rated Statements By Self</h2>
            {subject && (
                <div className='my-3'>
                    {/* <h2>Subject Specific Questions</h2> */}
                    {/* <h4>Top 5 Questions</h4> */}

                    {subjectQuestions.topQuestions.map((question, idx) => (
                        <>
                            <div className={`d-flex statement-main-box ${idx == 1 ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className='statement-box bg-primary'>
                                    <h6 className='statement-head'>Statement</h6>
                                    <p className='statement-text'>{idx + 1}</p>
                                </div>
                                <div className='question-box'>
                                    <div className='question-text'>
                                        <p>{question.questionText}</p>
                                    </div>
                                    <hr />
                                </div>
                            </div>

                            {/* <li key={idx}>{question.questionText} - Response: {question.response}</li> */}
                        </>
                    ))}
                </div>
            )}
            {subject && (
                    <div className='mt-5 my-3'>
                    {/* <h4>Bottom 5 Questions</h4> */}
                    <h2>Bottom Rated Statements By Self</h2>
                    {subjectQuestions.bottomQuestions.map((question, idx) => (
                        <>
                            {/* <li key={idx}>{question.questionText} - Response: {question.response}</li> */}

                            <div className={`d-flex statement-main-box ${idx == 1 ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className='statement-box bg-danger'>
                                    <h6 className='statement-head'>Statement</h6>
                                    <p className='statement-text'>{idx + 1}</p>
                                </div>
                                <div className='question-box'>
                                    <div className='question-text'>
                                        <p>{question.questionText}</p>
                                    </div>
                                    <hr />
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            )}

            {/* <h4>Treemap Representation</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        <Treemap data={treemapData} dataKey="value" stroke="#000" label={<CustomizedLabel />} >
                            {
                                treemapData.flatMap(group => 
                                    group.children.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} /> // Apply color from data
                                    ))
                                )
                            }
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer> */}
        </>
    )
}

export default SurveyTopBottom5QuestionsForSelf
