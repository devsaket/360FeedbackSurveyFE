import React, { useEffect } from 'react'
import { useState } from 'react';
import { Card, CardBody, CardHeader, Table } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell } from 'recharts';

const predefinedColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#FFBB28', '#00C49F'];

const SurveyTraitWiseAnalysis = ({ traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

    const [processedData, setProcessedData] = useState([]);

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

    useEffect(() => {
        const calculateAverage = (arr) => arr.reduce((sum, val) => sum + val, 0) / (arr.length || 1);

        // Step 1: Transform traitQuestionData
        const transformedData = Object.keys(traitQuestionData).map(trait => {
            const questions = traitQuestionData[trait];

            // Step 1: Transform traitQuestionData dynamically based on categoriesWithSelf
            // Initialize categoryAverages dynamically
            const categoryAverages = Object.fromEntries(categoriesWithSelf.map(cat => [cat.categoryName, []]));

            Object.values(questions).forEach(question => {
                categoriesWithSelf.forEach(({ categoryName }) => {
                    const responses = question.responses[categoryName] || [];
                    // Filter out 0 responses.
                    const nonZeroResponses = responses.filter(response => response !== 0);
                    // Only if there are non-zero responses, calculate and push the average.
                    if (nonZeroResponses.length > 0) {
                        const avgScore = calculateAverage(nonZeroResponses);
                        categoryAverages[categoryName].push(avgScore);
                    }
                    // const avgScore = calculateAverage(question.responses[categoryName] || []);
                    // categoryAverages[categoryName].push(avgScore);
                });
            });

            // Calculate overall averages
            const overallAverages = Object.fromEntries(
                // Object.entries(categoryAverages).map(([category, scores]) => [category, calculateAverage(scores)])
                Object.entries(categoryAverages).map(([category, scores]) => [
                    category, scores.length > 0 ? calculateAverage(scores) : 0
                ])
            );

            return { trait, ...overallAverages };
        });

        // Step 4: Calculate weighted average for categories except Self
        const finalData = transformedData.map(data => {
            const totalWeightedScore = surveyCategoryObject.reduce((acc, role) => {
                const avgScore = data[categoriesRolesObject.find(cat => cat._id === role.category)?.categoryName];
                const weight = role.scoreWeightage || 0;
                return acc + (avgScore * (weight / 100));
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
            const averageOfOthers = totalWeightedScore.toFixed(1);

            return { ...data, averageOfOthers: parseFloat(averageOfOthers) };
        });

        setProcessedData(finalData);
        console.log("Final Data = ", finalData);

    }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);

    // Add a color for 'Self' to the start of colors array
    const dynamicColors = [{ category: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];

    const renderTraitTable = () => {
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
                            <th className='text-center'>Self</th>
                            {
                                updatedSurveyCategory.map((key, index) =>
                                    <th key={index} className='text-center'>{key.categoryName}</th>
                                )
                            }
                            {/* <th className='text-center'>AverageOfCategories</th> */}
                            <th className='text-center'>Average of Others</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.map((row, index) => {

                            //const avgCategories = ( updatedSurveyCategory.reduce((sum, category) => sum + parseFloat(row[category.categoryName] || 0), 0) / updatedSurveyCategory.length
                            //);

                            return (
                                <tr key={index}>
                                    <td>{row.trait}</td>
                                    <td className='text-center'>{parseFloat(row.Self).toFixed(1)}</td>
                                    {updatedSurveyCategory.map((category) => (
                                        <td key={category.category} className='text-center'>
                                            {row[category.categoryName]?.toFixed(1)}
                                        </td>
                                    ))}
                                    {/* <td className='text-center'>{avgCategories.toFixed(1)}</td> */}
                                    <td className='text-center'>{row.averageOfOthers}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    };

    return (
        <>
            <h2>Detailed Trait Analysis</h2>
            {/* {renderTraitTable()} */}
            <div className="my-4">
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
                                            ...updatedSurveyCategory.map((category) => ({ category: category.categoryName, value: traitData[category.categoryName].toFixed(1) })), { category: 'Avg of Others', value: traitData.averageOfOthers }
                                        ]}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    >
                                        {/* <BarChart
                                        data={[
                                            { category: 'تقييم ذاتي', value: parseFloat(traitData['تقييم ذاتي']).toFixed(1) },
                                            ...updatedSurveyCategory.map((category) => ({ category: category.categoryName, value: traitData[category.categoryName].toFixed(1) })), { category: 'متوسط تقييم الآخرين', value: traitData.averageOfOthers }
                                        ]}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    > */}
                                        <XAxis type="number" domain={[0, 7]} tickCount={7} />
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
                                                // <Cell key={`cell-${idx}`} fill={item.category === 'متوسط تقييم الآخرين' ? '#FFA07A' : item.color} />
                                                <Cell key={`cell-${idx}`} fill={item.category === 'Avg of Others' ? '#FFA07A' : item.color} />
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
