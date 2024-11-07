import React, { useEffect } from 'react'
import { useState } from 'react';
import { Card, CardBody, CardHeader, Table } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell } from 'recharts';

const predefinedColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#FFBB28', '#00C49F'];

const SurveyTraitWiseAnalysis = ({ traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

    console.log("Trait  = ", traitData);
    console.log("Trait Category = ", traitCategoryData);
    console.log("Trait Question Data = ", traitQuestionData);
    console.log("surveyCategoryObject = ", surveyCategoryObject);
    console.log("categoriesRolesObject = ", categoriesRolesObject);

    const [processedData, setProcessedData] = useState([]);

    const calculateOverallAverageScore = (categories) => {
        const avgCategory = [...categories];
        avgCategory.shift();
        const categoryAvg = avgCategory.reduce((catAcc, category) => catAcc + parseFloat(category.averageScore), 0) / avgCategory.length;
        return categoryAvg.toFixed(1);
    };

    // Map over surveyCategory and add categoryName
    const updatedSurveyCategory = surveyCategoryObject.map((survey, index) => {
        const matchedCategory = categoriesRolesObject.find(category => category._id === survey.category);
        return {
            ...survey,
            categoryName: matchedCategory ? matchedCategory.categoryName : null,
            color: predefinedColors[index % predefinedColors.length]
        };
    });

    // Add 'Self' to updatedSurveyCategory
    const categoriesWithSelf = [{ categoryName: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];

    // console.log("updatedSurveyCategory = ", updatedSurveyCategory);

    const calculateCategoryAverage = (responses) => {
        return responses.length
            ? (responses.reduce((acc, val) => acc + val, 0) / responses.length).toFixed(2)
            : '0.00';
    };

    const calculateTotalAverage = (categories) => {
        // Exclude 'Self' for the total average
        const otherCategories = categories.filter(cat => cat.category !== 'Self');
        if (otherCategories.length === 0) return '0.00';
        const total = otherCategories.reduce((acc, category) => acc + parseFloat(category.averageScore), 0);
        return (total / otherCategories.length).toFixed(2);
    };

    const renderTraitTable = () => {
        // console.log('====================================');
        // console.log("processed trait Question Data = ", processedData);
        // console.log('====================================');
        if (!processedData || !Object.keys(processedData).length) {
            return <p>No trait data available.</p>;
        }

        return (
            <div>
                <h2>Survey Analysis - Trait Data</h2>
                <Table bordered>
                    <thead>
                        <tr>
                            <th>Trait</th>
                            <th>Self</th>
                            {
                                updatedSurveyCategory.map(key =>
                                    <th>{key.categoryName}</th>
                                )
                            }
                            <th>AverageOfCategories</th>
                            <th>Others</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {processedData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.trait}</td>
                                <td>{row.Self.toFixed(1)}</td>
                                {
                                    updatedSurveyCategory.map((category) => (
                                        <td key={category.category}>{row[category.categoryName]?.toFixed(1)}</td>
                                    ))
                                }
                                <td>{row.averageOfOthers}</td>
                            </tr>
                        ))} */}

                        {processedData.map((row, index) => {
                            const avgCategories = (
                                updatedSurveyCategory.reduce((sum, category) => sum + parseFloat(row[category.categoryName] || 0), 0) /
                                updatedSurveyCategory.length
                            ).toFixed(2);

                            return (
                                <tr key={index}>
                                    <td>{row.trait}</td>
                                    <td>{row.Self.toFixed(1)}</td>
                                    {updatedSurveyCategory.map((category) => (
                                        <td key={category.category}>
                                            {row[category.categoryName]?.toFixed(1)}
                                        </td>
                                    ))}
                                    <td>{avgCategories}</td> {/* New column */}
                                    <td>{row.averageOfOthers}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    };

    useEffect(() => {
        const calculateAverage = (arr) => arr.reduce((sum, val) => sum + val, 0) / (arr.length || 1);

        // Step 1: Transform traitQuestionData
        const transformedData = Object.keys(traitQuestionData).map(trait => {
            const questions = traitQuestionData[trait];
            // const categoryAverages = { Self: [], Parent: [], Peer: [], Teacher: [] };

            // Object.values(questions).forEach(question => {
            //     Object.keys(categoryAverages).forEach(category => {
            //         const avgScore = calculateAverage(question.responses[category] || []);
            //         categoryAverages[category].push(avgScore);
            //     });
            // });

            // // Step 2: Calculate the overall average for each category
            // const overallAverages = {};
            // Object.keys(categoryAverages).forEach(category => {
            //     overallAverages[category] = calculateAverage(categoryAverages[category]);
            // });


            // Step 1: Transform traitQuestionData dynamically based on categoriesWithSelf

            // Initialize categoryAverages dynamically
            const categoryAverages = Object.fromEntries(categoriesWithSelf.map(cat => [cat.categoryName, []]));

            Object.values(questions).forEach(question => {
                categoriesWithSelf.forEach(({ categoryName }) => {
                    const avgScore = calculateAverage(question.responses[categoryName] || []);
                    categoryAverages[categoryName].push(avgScore);
                });
            });

            // Calculate overall averages
            const overallAverages = Object.fromEntries(
                Object.entries(categoryAverages).map(([category, scores]) => [category, calculateAverage(scores)])
            );

            return { trait, ...overallAverages };
        });

        // Step 4: Calculate weighted average for categories except Self
        const finalData = transformedData.map(data => {
            const totalWeightedScore = categoriesRolesObject.reduce((acc, role) => {
                const avgScore = data[role.categoryName];
                const weight = surveyCategoryObject.find(cat => cat.category === role._id)?.scoreWeightage || 0;
                return acc + avgScore * (weight/100);
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
            const averageOfOthers = totalWeightedScore.toFixed(2);

            return { ...data, averageOfOthers };
        });

        setProcessedData(finalData);

    }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);

    // Function to reduce the data to the desired format
    const reduceResponses = (data) => {
        const reducedData = {};

        for (let trait in data) {
            reducedData[trait] = Object.keys(data[trait]).map((key) => {
                const { responses } = data[trait][key];

                const avgResponses = responses.reduce((acc, response) => {
                    const category = Object.keys(response)[0];
                    const values = response[category];
                    const avgValue = values.reduce((sum, value) => sum + value, 0) / values.length;
                    acc[category] = avgValue;
                    return acc;
                }, {});

                return { [key]: { questionText: data[trait][key].questionText, responses: avgResponses } };
            });
        }

        return reducedData;
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

    // const colors = {
    //     Self: '#8884d8',
    //     Parent: '#82ca9d',
    //     Peer: '#ffc658',
    //     Teacher: '#ff7f50'
    // };

    // Add a color for 'Self' to the start of colors array
    const dynamicColors = [{ category: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];

    return (
        <>
            {/* <h2>Detailed Trait Analysis</h2> */}
            {/* <div className="my-4"> */}
            {/* {Array.isArray(traitData) && traitData.map((row, index) => (
                    <React.Fragment key={index}>
                        <Card className='shadow mb-4'>
                            <CardHeader><h3>{row.trait}</h3></CardHeader>
                            <CardBody> */}
            {/* { */}
            {/* traitCategoryData.map((traitRow, index) => ( */}
            {/* <React.Fragment key={index}> */}
            {/* {row.trait === traitRow.trait ? */}
            <>
                {/* <p className='d-none'>{traitRow.categories.push({ category: "Average of Others", averageScore: calculateOverallAverageScore(traitRow.categories).toString() })}</p> */}
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
                {/* <ResponsiveContainer width="90%" height={400} className="mx-5">
                                                    <BarChart layout="vertical" data={traitRow.categories}>
                                                        <YAxis type='category' dataKey="category" />
                                                        <XAxis type='number' domain={[0, 7]} tickCount={8} />
                                                        <Tooltip />
                                                        <Bar dataKey="averageScore" fill="#8884d8" label={{ position: 'right' }} >
                                                            {
                                                                traitRow.categories.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={colors[index % 20]} />
                                                                ))
                                                            }
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer> */}
            </>
            {/* : '' */}
            {/* } */}
            {/* </React.Fragment> */}
            {/* ))} */}
            {/* </CardBody>
                        </Card> */}
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
            {/* </React.Fragment>
                ))} */}
            {/* </div> */}


            <h2> New Detailed Trait Analysis</h2>
            <div className="my-4">
                <p>Render Trait Table</p>
                {renderTraitTable()}
                {processedData.map((traitData, index) => {
                    // Calculate the average of all categories except 'Self' for each trait
                    const avgCategories = (
                        updatedSurveyCategory.reduce((sum, category) => sum + parseFloat(traitData[category.categoryName] || 0), 0) /
                        updatedSurveyCategory.length
                    ).toFixed(1);

                    return (
                        <Card key={index} className="mb-4 shadow">
                            <CardHeader><h4>{traitData.trait}</h4></CardHeader>
                            <CardBody>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={[
                                            { category: 'Self', value: traitData.Self.toFixed(1) },
                                            ...updatedSurveyCategory.map((category) => ({ category: category.categoryName, value: traitData[category.categoryName].toFixed(1) })), { category: 'Others', value: avgCategories }
                                        ]}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    >
                                        <XAxis type="number" domain={[0, 7]} tickCount={8} />
                                        <YAxis type="category" dataKey="category" />
                                        <Tooltip />
                                        <Bar dataKey="value" label={{ position: 'right' }}>
                                            {/* <Cell key={`cell-0`} fill={colors['Self']} /> */}
                                            {/* {
                                            updatedSurveyCategory.map((category, idx) => (
                                                <Cell key={`cell-${idx}`} fill={colors[category.categoryName]} />
                                            ))
                                        } */}
                                            {dynamicColors.map((item, idx) => (
                                                <Cell key={`cell-${idx}`} fill={item.category === 'Others' ? '#FFA07A' : item.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>
                    )
                })}


            </div>

        </>
    )
}

export default SurveyTraitWiseAnalysis
