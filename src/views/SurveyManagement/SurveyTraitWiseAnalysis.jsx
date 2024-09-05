import React, { useEffect } from 'react'
import { useState } from 'react';
import { Card, CardBody, CardHeader, Table } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell } from 'recharts';

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];

const SurveyTraitWiseAnalysis = ({ traitCategoryData, traitData, traitQuestionData }) => {

    const calculateOverallAverageScore = (categories) => {
        const categoryAvg = categories.reduce((catAcc, category) => catAcc + parseFloat(category.averageScore), 0) / categories.length;
        return categoryAvg.toFixed(1);
    };

    // const getTopAndBottomQuestions = (trait) => {
    //     const questions = traitQuestionData[trait];
    //     const sortedQuestions = Object.keys(questions).map(questionId => {
    //         const details = questions[questionId];
    //         const averageResponse = details.responses.reduce((acc, score) => acc + score, 0) / details.responses.length;
    //         return {
    //             questionText: details.questionText,
    //             averageResponse
    //         };
    //     }).sort((a, b) => b.averageResponse - a.averageResponse);

    //     const topQuestions = sortedQuestions.filter(q => q.averageResponse >= 6).slice(0, 5);
    //     const bottomQuestions = sortedQuestions.filter(q => q.averageResponse < 4).slice(0, 5);

    //     return { topQuestions, bottomQuestions };
    // };

    const getTopAndBottomQuestions = (trait) => {
        const questions = traitQuestionData[trait];
        const sortedQuestions = Object.keys(questions).map(questionId => {
            const details = questions[questionId];
            const validResponses = details.responses.filter(response => response > 0); // Filter out responses with 0
            const averageResponse = validResponses.reduce((acc, score) => acc + score, 0) / validResponses.length;
            return {
                questionText: details.questionText,
                averageResponse
            };
        }).sort((a, b) => b.averageResponse - a.averageResponse);

        const topQuestions = sortedQuestions.slice(0, 5);
        const bottomQuestions = sortedQuestions.reverse().slice(0, 5);

        return { topQuestions, bottomQuestions };
    };

    const renderBarChart = (data) => (
        <BarChart width={500} height={300} data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis type="number" domain={[0, 7]} tickCount={8} />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageScore" fill="#8884d8" minPointSize={5}>
                <LabelList dataKey="averageScore" position="top" />
            </Bar>
        </BarChart>
    );

    return (
        <>
            <h2>Detailed Trait Analysis</h2>
            <div className="my-4">
                {Array.isArray(traitData) && traitData.map((row, index) => (
                    <React.Fragment key={index}>                            
                            <Card className='shadow mb-4'>
                                <CardHeader><h3>{row.trait}</h3></CardHeader>
                                <CardBody>
                                    {traitCategoryData.map((traitRow, index) => (
                                        <React.Fragment key={index}>
                                            {row.trait === traitRow.trait ?
                                                <>
                                                    <p className='d-none'>{traitRow.categories.push({ category: "Average of Others", averageScore: calculateOverallAverageScore(traitRow.categories).toString() })}</p>
                                                    {/* <Table bordered>
                                                        <thead>
                                                            <th>Category</th>
                                                            <th>Average Score</th>
                                                        </thead>
                                                        <tbody>
                                                            {traitRow.categories.map((category, idx) => (
                                                                <>
                                                                    <tr key={idx}>
                                                                        <td>{category.category} &nbsp;</td>
                                                                        <td> <span className='px-2'>{category.averageScore}</span> </td>
                                                                    </tr>
                                                                </>
                                                            ))}
                                                        </tbody>
                                                    </Table> */}
                                                    {/* <p className='d-none'>{traitRow.categories.push({ category: "Maximum Score", averageScore: 7 })}</p> */}
                                                    {/* {traitRow.categories.map((category, idx) => (
                                                        <>
                                                            <div key={idx} className='d-flex justify-content-start'>
                                                                <p>{category.category} &nbsp;</p>
                                                                <p className='d-flex align-items-center justify-content-center'>
                                                                    <span className='px-2'>{category.averageScore}</span>
                                                                </p>
                                                            </div>

                                                        </>
                                                    ))} */}
                                                    <ResponsiveContainer width="90%" height={400} className="mx-5">
                                                        <BarChart layout="vertical" data={traitRow.categories}>
                                                            <YAxis type='category' dataKey="category" />
                                                            <XAxis type='number' domain={[0, 7]} tickCount={8} />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="averageScore" fill="#8884d8" label={{ position: 'right' }} >
                                                                {
                                                                    traitRow.categories.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={colors[index % 20]} />
                                                                    ))
                                                                }
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </>
                                                : ''
                                            }
                                        </React.Fragment>
                                    ))}
                                </CardBody>
                            </Card>
                            {/*<div>
                                <h4>Top Rated Questions (Average Responses ≥ 6)</h4>
                                <ul>
                                    {getTopAndBottomQuestions(row.trait).topQuestions.map((question, idx) => (
                                        <>
                                            <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li>
                                            <li key={idx}>{question.questionText}</li>
                                        </>
                                    ))}
                                </ul>
                                <h4>Bottom Rated Questions (Average Responses &lt; 4)</h4>
                                <ul>
                                    {getTopAndBottomQuestions(row.trait).bottomQuestions.map((question, idx) => (
                                        <>
                                            <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li>
                                            <li key={idx}>{question.questionText} </li>
                                        </>
                                    ))}
                                </ul>
                            </div> */}
                    </React.Fragment>
                ))}
            </div>


        </>
    )
}

export default SurveyTraitWiseAnalysis
