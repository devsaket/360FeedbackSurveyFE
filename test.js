//Act as a professional react developer. I have created a component name "", "SurveyAnalysis" which is as follows : - 

const predefinedColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#FFBB28', '#00C49F'];

const SurveyTraitWiseAnalysis = ({ traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {
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
                            <th>Others</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.map((row, index) => (
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
                        ))}
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
                return acc + avgScore * weight;
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);

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

// Add a color for 'Self' to the start of colors array
    const dynamicColors = [{ category: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];

return (
        <>
<h2> New Detailed Trait Analysis</h2>
            <div className="my-4">
                <p>Render Trait Table</p>
                {renderTraitTable()}
                {processedData.map((traitData, index) => (
                    <Card key={index} className="mb-4 shadow">
                        <CardHeader><h4>{traitData.trait}</h4></CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { category: 'Self', value: traitData.Self.toFixed(1) },
                                        ...updatedSurveyCategory.map((category) => ({ category: category.categoryName, value: traitData[category.categoryName].toFixed(1) }))
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
                                            <Cell key={`cell-${idx}`} fill={item.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                ))}


            </div>

        </>
    )
}

export default SurveyTraitWiseAnalysis


const SurveyAnalysis = () => {
    const { id, subjectId } = useParams();

    const [surveyResponseObject, setSurveyResponseObject] = useState([]);
    const [surveyObject, setSurveyObject] = useState([]);
    const [subjectObject, setSubjectObject] = useState([]);
    const [categoriesRolesObject, setCategoryRolesObject] = useState([]);
    const [surveyCategoryObject, setSurveyCategoryObject] = useState([]);
    const [questionObjects, setQuestionObjects] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [traitData, setTraitData] = useState([]);
    const [traitDetails, setTraitDetails] = useState([]);
    const [categoryTraitData, setCategoryTraitData] = useState([]);
    const [traitCategoryData, setTraitCategoryData] = useState([]);
    const [traitSelfOthersData, setTraitSelfOthersData] = useState([]);
    const [traitRespondentsData, setTraitRespondentsData] = useState([]);
    const [traitQuestionData, setTraitQuestionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                const categoryResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/categoryRoles/');
                setCategoryRolesObject(categoryResponse.data);
                // console.log("Category Roles response = ", categoryResponse.data);

                const questionResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/');
                setQuestionObjects(questionResponse.data);
                // console.log("Question response = ", questionResponse.data);

                const traitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/');
                setTraitDetails(traitResponse.data);
                // console.log("Trait response = ", traitResponse.data);

                const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`);
                setSurveyObject(surveyResponse.data);
                // console.log("Survey response = ", surveyResponse.data);
                setSurveyCategoryObject(surveyResponse.data[0].categories)
                // console.log("Survey Category response = ", surveyResponse.data[0].categories);
                
                const surveyResultResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response/${id}`);
                setSurveyResponseObject(surveyResultResponse.data);
                // console.log("Survey Result response = ", surveyResultResponse.data);

                const surveyResultSubjectDataResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response?surveyId=${id}&subjectId=${subjectId}`);
                setSubjectObject(surveyResultSubjectDataResponse.data);
                // console.log("Survey Subject Result response = ", surveyResultSubjectDataResponse.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyData();
    }, [id, subjectId]);

    useEffect(() => {
        if (loading || !surveyObject.length || !surveyResponseObject.length) return;

        surveyObject.subject = subjectObject;

        // Function to get category name and score weightage
        const getCategoryDetails = (categoryId) => {
            const category = categoriesRolesObject.find(cat => cat._id === categoryId);
            if (category) {
                const surveyCategory = surveyObject[0].categories.find(cat => cat.category === categoryId);
                return { categoryName: category.categoryName, scoreWeightage: surveyCategory ? surveyCategory.scoreWeightage : 0 };
            }
            return { categoryName: '', scoreWeightage: 0 };
        };

        // Function to calculate the total score
        const calculateTotalScore = (responses) => {
            return responses.reduce((total, response) => total + (parseInt(response.answer, 10) > 0 ? (parseInt(response.answer, 10)) : 0), 0);
        };

        // Function to get trait details for a question
        const getTraitDetails = (questionId) => {
            const question = questionObjects.find(q => q._id === questionId);
            return question ? question.trait.traitName : null;
        };

        // Process the data to match the requirements
        const processedTableData = [];
        const summaryData = [];
        const traitScores = {};
        const categoryTraitScores = {};
        const traitCategoryScores = {};
        const traitQuestionData = {};

        const filteredSubject = surveyResponseObject.find(surveyResponse => surveyResponse.subject.some(sub => sub._id === subjectId));

        if (filteredSubject) {
            filteredSubject.subject.forEach(subject => {
                if (subject._id === subjectId) {

                    const { categoryName, scoreWeightage } = { categoryName: 'Self', scoreWeightage: 100 };
                    // Subject row
                    const subjectRow = {
                        surveySubmittedBy: subject.subjectName,
                        questionResponses: surveyObject[0].questions.map(questionId => {
                            const response = subject.responses.find(res => res.questionId === questionId);
                            return response ? response.answer : '0';
                        }),
                        categoryName: 'Self',
                        scoreWeightage: 100,
                        totalScore: calculateTotalScore(subject.responses)
                    };
                    processedTableData.push(subjectRow);

                    // Aggregate trait scores
                    subject.responses.forEach(response => {
                        const trait = getTraitDetails(response.questionId);
                        if (trait) {
                            if (!traitScores[trait]) {
                                traitScores[trait] = { totalScore: 0, count: 0 };
                            }
                            traitScores[trait].totalScore += parseInt(response.answer, 10) || 0;
                            traitScores[trait].count += 1;

                            if (!categoryTraitScores[categoryName]) {
                                categoryTraitScores[categoryName] = {};
                            }
                            if (!categoryTraitScores[categoryName][trait]) {
                                categoryTraitScores[categoryName][trait] = { totalScore: 0, count: 0 };
                            }
                            categoryTraitScores[categoryName][trait].totalScore += parseInt(response.answer, 10) || 0;
                            categoryTraitScores[categoryName][trait].count += 1;

                            if (!traitCategoryScores[trait]) {
                                traitCategoryScores[trait] = {};
                            }
                            if (!traitCategoryScores[trait][categoryName]) {
                                traitCategoryScores[trait][categoryName] = { totalScore: 0, count: 0 };
                            }
                            traitCategoryScores[trait][categoryName].totalScore += parseInt(response.answer, 10) || 0;
                            traitCategoryScores[trait][categoryName].count += 1;

                            if (!traitQuestionData[trait]) {
                                traitQuestionData[trait] = {};
                            }
                            if (!traitQuestionData[trait][response.questionId]) {
                                traitQuestionData[trait][response.questionId] = {
                                    questionText: questionObjects.find(q => q._id === response.questionId)?.question || '',
                                    // responses: {}
                                    responses: []
                                };
                            }
                            if (!traitQuestionData[trait][response.questionId].responses[categoryName]) {
                                traitQuestionData[trait][response.questionId].responses[categoryName] = [];
                            }
                            traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10) || 0);
                            // traitQuestionData[trait][response.questionId].responses.push(parseInt(response.answer, 10) || 0);
                        }
                    });

                    // Respondent rows and summary data
                    const categoryCounts = {};
                    // Add subject to summary
                    categoryCounts['Self'] = { nominated: 1, completed: subject.isFilled ? 1 : 0 }; // Self is always nominated and completed


                    subject.respondent.forEach(respondent => {
                        const { categoryName, scoreWeightage } = getCategoryDetails(respondent.category);
                        const respondentRow = {
                            surveySubmittedBy: respondent.respondentName,
                            questionResponses: surveyObject[0].questions.map(questionId => {
                                const response = respondent.responses.find(res => res.questionId === questionId);
                                return response ? response.answer : '0';
                            }),
                            categoryName,
                            scoreWeightage,
                            totalScore: calculateTotalScore(respondent.responses)
                        };
                        processedTableData.push(respondentRow);

                        // Count the respondents for summary
                        if (!categoryCounts[categoryName]) {
                            categoryCounts[categoryName] = { nominated: 0, completed: 0 };
                        }
                        categoryCounts[categoryName].nominated += 1;
                        // if (respondent.responses.length > 0) {
                        //     categoryCounts[categoryName].completed += 1;
                        // }
                        if (respondent.isFilled) {
                            categoryCounts[categoryName].completed += 1;
                        }

                        // Aggregate trait scores
                        respondent.responses.forEach(response => {
                            const trait = getTraitDetails(response.questionId);
                            if (trait) {
                                if (!traitScores[trait]) {
                                    traitScores[trait] = { totalScore: 0, count: 0 };
                                }
                                traitScores[trait].totalScore += parseInt(response.answer, 10) || 0;
                                traitScores[trait].count += 1;

                                if (!categoryTraitScores[categoryName]) {
                                    categoryTraitScores[categoryName] = {};
                                }
                                if (!categoryTraitScores[categoryName][trait]) {
                                    categoryTraitScores[categoryName][trait] = { totalScore: 0, count: 0 };
                                }
                                categoryTraitScores[categoryName][trait].totalScore += parseInt(response.answer, 10) || 0;
                                categoryTraitScores[categoryName][trait].count += 1;

                                if (!traitCategoryScores[trait]) {
                                    traitCategoryScores[trait] = {};
                                }
                                if (!traitCategoryScores[trait][categoryName]) {
                                    traitCategoryScores[trait][categoryName] = { totalScore: 0, count: 0 };
                                }
                                traitCategoryScores[trait][categoryName].totalScore += parseInt(response.answer, 10) || 0;
                                traitCategoryScores[trait][categoryName].count += 1;

                                if (!traitQuestionData[trait]) {
                                    traitQuestionData[trait] = {};
                                }
                                if (!traitQuestionData[trait][response.questionId]) {
                                    traitQuestionData[trait][response.questionId] = {
                                        questionText: questionObjects.find(q => q._id === response.questionId)?.question || '',
                                        // responses: {}
                                        responses: []
                                    };
                                }
                                if (!traitQuestionData[trait][response.questionId].responses[categoryName]) {
                                    traitQuestionData[trait][response.questionId].responses[categoryName] = [];
                                }
                                
                                if(parseInt(response.answer, 10) > 0){
                                    traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10));
                                }
                                // traitQuestionData[trait][response.questionId].responses.push(parseInt(response.answer, 10) || 0);
                            }
                        });

                    });

                    // Convert categoryCounts to summaryData format
                    for (const category in categoryCounts) {
                        const { nominated, completed } = categoryCounts[category];
                        summaryData.push({
                            category,
                            nominated,
                            completed,
                            completionRate: ((completed / nominated) * 100).toFixed(1)
                        });
                    }
                }
            });
        }

        // Calculate average score for each trait
        const processedTraitData = Object.keys(traitScores).map(trait => ({
            trait,
            totalScore: traitScores[trait].totalScore,
            averageScore: (traitScores[trait].totalScore / traitScores[trait].count).toFixed(1)
        }));

        // Calculate average score for each trait by category
        const processedCategoryTraitData = Object.keys(categoryTraitScores).map(category => {
            const traits = Object.keys(categoryTraitScores[category]).map(trait => ({
                trait,
                averageScore: (categoryTraitScores[category][trait].totalScore / categoryTraitScores[category][trait].count).toFixed(1)
            }));

            // console.log({ category, traits })
            return { category, traits };
        });

        // Calculate average score for each trait and category
        const processedTraitCategoryData = Object.keys(traitCategoryScores).map(trait => {
            const categories = Object.keys(traitCategoryScores[trait]).map(category => ({
                category, averageScore: (traitCategoryScores[trait][category].totalScore / traitCategoryScores[trait][category].count).toFixed(1)
            }));

            return { trait, categories };
        });

        const processTraitSelfOthersData = (data) => {
            return data.map(item => {
                const selfRating = item.categories.find(cat => cat.category === "Self")?.averageScore || 0;
                const otherRatings = item.categories.filter(cat => cat.category !== "Self")?.map(cat => cat.averageScore);
                // console.log(otherRatings);
                const averageOtherRating = otherRatings.length > 0 ? (otherRatings.reduce((acc, score) => acc + parseFloat(score), 0) / otherRatings.length).toFixed(1) : 0;
                // console.log(averageOtherRating)

                return {
                    trait: item.trait,
                    selfRating,
                    averageOtherRating
                };
            });
        };

        const processTraitRespondentsData = (data) => {
            return data.map(item => {
                const otherRatings = item.categories.filter(cat => cat.category !== "Self")?.map(cat => cat.averageScore);
                // console.log(otherRatings);
                const averageOtherRating = otherRatings.length > 0 ? (otherRatings.reduce((acc, score) => acc + parseFloat(score), 0) / otherRatings.length).toFixed(1) : 0;
                // console.log(averageOtherRating)

                return {
                    trait: item.trait,
                    averageOtherRating
                };
            });
        };

        setTableData(processedTableData);
        // console.log(summaryData);
        setSummaryData(summaryData);

        setTraitData(processedTraitData);
        setCategoryTraitData(processedCategoryTraitData);
        setTraitCategoryData(processedTraitCategoryData);
        setTraitSelfOthersData(processTraitSelfOthersData(processedTraitCategoryData));
        setTraitRespondentsData(processTraitRespondentsData(processedTraitCategoryData));
        setTraitQuestionData(traitQuestionData);
    }, [loading, subjectId, subjectObject, surveyObject, surveyResponseObject, categoriesRolesObject, questionObjects]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }



    return (
        <>
		{/* Detailed Trait Analysis */}
                        <Card>
                            <CardBody>
                                <SurveyTraitWiseAnalysis traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

</>
    );
}

export default SurveyAnalysis;

//From the above SurveyAnalysis component, I have received the following responses : - 

categoriesRolesObject=[
    {"_id": '6713b87cd4ad96825deb7990', "categoryName": 'Peer', "categoryLabel": 'Peer', "createdOn": '2024-10-19T13:47:40.792Z', "__v": 0},
    {"_id": '6713b886d4ad96825deb7993', "categoryName": 'Teacher', "categoryLabel": 'Teacher', "createdOn": '2024-10-19T13:47:50.283Z', "__v": 0},
    {"_id": '6713b88ed4ad96825deb7996', "categoryName": 'Parent', "categoryLabel": 'Parent', "createdOn": '2024-10-19T13:47:58.747Z', "__v": 0}
]

questionObjects= [
    {
        "_id": "669a4537406f2715253e8a51",
        "question": "Question S01T01",
        "questionOthers": "Question R01T01",
        "trait": {
            "_id": "669a4485406f2715253e8a3b",
            "traitName": "Trait 01",
            "traitDescription": "Trait 01 Trait 01 Trait 01Trait 01 Trait 01 Trait 01Trait 01",
            "status": true,
            "createdOn": "2024-07-19T10:48:37.541Z",
            "__v": 0
        },
        "questionCode": "000001",
        "createdOn": "2024-07-19T10:51:35.721Z",
        "__v": 0
    },
    {
        "_id": "669a4555406f2715253e8a57",
        "question": "Question S02T01",
        "questionOthers": "Question R02T01",
        "trait": {
            "_id": "669a4485406f2715253e8a3b",
            "traitName": "Trait 01",
            "traitDescription": "Trait 01 Trait 01 Trait 01Trait 01 Trait 01 Trait 01Trait 01",
            "status": true,
            "createdOn": "2024-07-19T10:48:37.541Z",
            "__v": 0
        },
        "questionCode": "000002",
        "createdOn": "2024-07-19T10:52:05.179Z",
        "__v": 0
    },
    {
        "_id": "669a46b7406f2715253e8a8d",
        "question": "Question S01T03",
        "questionOthers": "Question R01T03",
        "trait": {
            "_id": "669a44a4406f2715253e8a41",
            "traitName": "Trait 03",
            "traitDescription": "Trait 03Trait 03Trait 03Trait 03",
            "status": true,
            "createdOn": "2024-07-19T10:49:08.656Z",
            "__v": 0
        },
        "questionCode": "000011",
        "createdOn": "2024-07-19T10:57:59.733Z",
        "__v": 0
    },
    {
        "_id": "669a46cb406f2715253e8a93",
        "question": "Question S02T03",
        "questionOthers": "Question R02T03",
        "trait": {
            "_id": "669a44a4406f2715253e8a41",
            "traitName": "Trait 03",
            "traitDescription": "Trait 03Trait 03Trait 03Trait 03",
            "status": true,
            "createdOn": "2024-07-19T10:49:08.656Z",
            "__v": 0
        },
        "questionCode": "000012",
        "createdOn": "2024-07-19T10:58:19.334Z",
        "__v": 0
    },
    {
        "_id": "669a476a406f2715253e8aaf",
        "question": "Question S01T04",
        "questionOthers": "Question R01T04",
        "trait": {
            "_id": "669a44b3406f2715253e8a44",
            "traitName": "Trait 04",
            "traitDescription": "Trait 04 Trait 04Trait 04Trait 04 Trait 04Trait 04Trait 04",
            "status": true,
            "createdOn": "2024-07-19T10:49:23.732Z",
            "__v": 0
        },
        "questionCode": "000016",
        "createdOn": "2024-07-19T11:00:58.834Z",
        "__v": 0
    },
    {
        "_id": "669a477b406f2715253e8ab5",
        "question": "Question S02T04",
        "questionOthers": "Question R02T04",
        "trait": {
            "_id": "669a44b3406f2715253e8a44",
            "traitName": "Trait 04",
            "traitDescription": "Trait 04 Trait 04Trait 04Trait 04 Trait 04Trait 04Trait 04",
            "status": true,
            "createdOn": "2024-07-19T10:49:23.732Z",
            "__v": 0
        },
        "questionCode": "000017",
        "createdOn": "2024-07-19T11:01:15.339Z",
        "__v": 0
    },
    {
        "_id": "669a478e406f2715253e8abb",
        "question": "Question S03T04",
        "questionOthers": "Question R03T04",
        "trait": {
            "_id": "669a44b3406f2715253e8a44",
            "traitName": "Trait 04",
            "traitDescription": "Trait 04 Trait 04Trait 04Trait 04 Trait 04Trait 04Trait 04",
            "status": true,
            "createdOn": "2024-07-19T10:49:23.732Z",
            "__v": 0
        },
        "questionCode": "000018",
        "createdOn": "2024-07-19T11:01:34.476Z",
        "__v": 0
    },
    {
        "_id": "669a46dc406f2715253e8a99",
        "question": "Question S03T03",
        "questionOthers": "Question S03T03",
        "trait": {
            "_id": "669a44a4406f2715253e8a41",
            "traitName": "Trait 03",
            "traitDescription": "Trait 03Trait 03Trait 03Trait 03",
            "status": true,
            "createdOn": "2024-07-19T10:49:08.656Z",
            "__v": 0
        },
        "questionCode": "000013",
        "createdOn": "2024-07-19T10:58:36.289Z",
        "__v": 0
    },
    {
        "_id": "669a4592406f2715253e8a5d",
        "question": "Question S03T01",
        "questionOthers": "Question R03T01",
        "trait": {
            "_id": "669a4485406f2715253e8a3b",
            "traitName": "Trait 01",
            "traitDescription": "Trait 01 Trait 01 Trait 01Trait 01 Trait 01 Trait 01Trait 01",
            "status": true,
            "createdOn": "2024-07-19T10:48:37.541Z",
            "__v": 0
        },
        "questionCode": "000003",
        "createdOn": "2024-07-19T10:53:06.960Z",
        "__v": 0
    }
]

traitDetails =[
    {
        "_id": "669a4485406f2715253e8a3b",
        "traitName": "Trait 01",
        "traitDescription": "Trait 01 Trait 01 Trait 01Trait 01 Trait 01 Trait 01Trait 01",
        "status": true,
        "createdOn": "2024-07-19T10:48:37.541Z",
        "__v": 0
    },
    {
        "_id": "669a44a4406f2715253e8a41",
        "traitName": "Trait 03",
        "traitDescription": "Trait 03Trait 03Trait 03Trait 03",
        "status": true,
        "createdOn": "2024-07-19T10:49:08.656Z",
        "__v": 0
    },
    {
        "_id": "669a44b3406f2715253e8a44",
        "traitName": "Trait 04",
        "traitDescription": "Trait 04 Trait 04Trait 04Trait 04 Trait 04Trait 04Trait 04",
        "status": true,
        "createdOn": "2024-07-19T10:49:23.732Z",
        "__v": 0
    }
]

surveyObject =[
    {
        "_id": "6715d68aa28f6d0d6b7e9917",
        "surveyName": "Survey test 2",
        "surveyDescription": "Survey test 2Survey test 2Survey test 2Survey test 2",
        "traits": [
            "669a4485406f2715253e8a3b",
            "669a44a4406f2715253e8a41",
            "669a44b3406f2715253e8a44"
        ],
        "questions": [
            "669a4537406f2715253e8a51",
            "669a4555406f2715253e8a57",
            "669a46b7406f2715253e8a8d",
            "669a46cb406f2715253e8a93",
            "669a476a406f2715253e8aaf",
            "669a477b406f2715253e8ab5",
            "669a478e406f2715253e8abb",
            "669a46dc406f2715253e8a99",
            "669a4592406f2715253e8a5d"
        ],
        "categories": [
            {
                "category": "6713b87cd4ad96825deb7990",
                "scoreWeightage": 30,
                "maxRespondents": 2,
                "_id": "6715d68aa28f6d0d6b7e9918"
            },
            {
                "category": "6713b886d4ad96825deb7993",
                "scoreWeightage": 40,
                "maxRespondents": 2,
                "_id": "6715d68aa28f6d0d6b7e9919"
            },
            {
                "category": "6713b88ed4ad96825deb7996",
                "scoreWeightage": 30,
                "maxRespondents": 2,
                "_id": "6715d68aa28f6d0d6b7e991a"
            }
        ],
        "createdOn": "2024-10-21T04:20:26.351Z",
        "__v": 0
    }
]

surveyCategoryObject=[
    {"category": '6713b87cd4ad96825deb7990', "scoreWeightage": 30, "maxRespondents": 2, "_id": '6715d68aa28f6d0d6b7e9918'},
    {"category": '6713b886d4ad96825deb7993', "scoreWeightage": 40, "maxRespondents": 2, "_id": '6715d68aa28f6d0d6b7e9919'},
    {"category": '6713b88ed4ad96825deb7996', "scoreWeightage": 30, "maxRespondents": 2, "_id": '6715d68aa28f6d0d6b7e991a'}
]

surveyResponseObject =[
    {
        "_id": "6715d68aa28f6d0d6b7e991c",
        "surveyId": "6715d68aa28f6d0d6b7e9917",
        "subject": [
            {
                "subjectPhone": "",
                "subjectName": "Subject Survey",
                "subjectEmail": "saket1996225@gmail.com",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "4",
                        "_id": "6715d6c6a28f6d0d6b7e9934"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "5",
                        "_id": "6715d6c6a28f6d0d6b7e9935"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "7",
                        "_id": "6715d6c6a28f6d0d6b7e9936"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "7",
                        "_id": "6715d6c6a28f6d0d6b7e9937"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "6",
                        "_id": "6715d6c6a28f6d0d6b7e9938"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "7",
                        "_id": "6715d6c6a28f6d0d6b7e9939"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "5",
                        "_id": "6715d6c6a28f6d0d6b7e993a"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "6",
                        "_id": "6715d6c6a28f6d0d6b7e993b"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "6",
                        "_id": "6715d6c6a28f6d0d6b7e993c"
                    }
                ],
                "isFilled": true,
                "respondent": [
                    {
                        "respondentName": "Peer Respondent 1",
                        "respondentEmail": "jsakjsd@gmail.com",
                        "category": "6713b87cd4ad96825deb7990",
                        "responses": [
                            {
                                "questionId": "669a4537406f2715253e8a51",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e994a"
                            },
                            {
                                "questionId": "669a4555406f2715253e8a57",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e994b"
                            },
                            {
                                "questionId": "669a46b7406f2715253e8a8d",
                                "answer": "0",
                                "_id": "6715d74ca28f6d0d6b7e994c"
                            },
                            {
                                "questionId": "669a46cb406f2715253e8a93",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e994d"
                            },
                            {
                                "questionId": "669a476a406f2715253e8aaf",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e994e"
                            },
                            {
                                "questionId": "669a477b406f2715253e8ab5",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e994f"
                            },
                            {
                                "questionId": "669a478e406f2715253e8abb",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9950"
                            },
                            {
                                "questionId": "669a46dc406f2715253e8a99",
                                "answer": "3",
                                "_id": "6715d74ca28f6d0d6b7e9951"
                            },
                            {
                                "questionId": "669a4592406f2715253e8a5d",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9952"
                            }
                        ],
                        "isFilled": true,
                        "_id": "6715d74ca28f6d0d6b7e9949"
                    },
                    {
                        "respondentName": "Peer Respondent 1",
                        "respondentEmail": "dmsaketk@gmail.com",
                        "category": "6713b87cd4ad96825deb7990",
                        "responses": [
                            {
                                "questionId": "669a4537406f2715253e8a51",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9954"
                            },
                            {
                                "questionId": "669a4555406f2715253e8a57",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9955"
                            },
                            {
                                "questionId": "669a46b7406f2715253e8a8d",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9956"
                            },
                            {
                                "questionId": "669a46cb406f2715253e8a93",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9957"
                            },
                            {
                                "questionId": "669a476a406f2715253e8aaf",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9958"
                            },
                            {
                                "questionId": "669a477b406f2715253e8ab5",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9959"
                            },
                            {
                                "questionId": "669a478e406f2715253e8abb",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e995a"
                            },
                            {
                                "questionId": "669a46dc406f2715253e8a99",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e995b"
                            },
                            {
                                "questionId": "669a4592406f2715253e8a5d",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e995c"
                            }
                        ],
                        "isFilled": true,
                        "_id": "6715d74ca28f6d0d6b7e9953"
                    },
                    {
                        "respondentName": "Teacher Respondent 1",
                        "respondentEmail": "jsakjsd@gmail.com",
                        "category": "6713b886d4ad96825deb7993",
                        "responses": [
                            {
                                "questionId": "669a4537406f2715253e8a51",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e995e"
                            },
                            {
                                "questionId": "669a4555406f2715253e8a57",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e995f"
                            },
                            {
                                "questionId": "669a46b7406f2715253e8a8d",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e9960"
                            },
                            {
                                "questionId": "669a46cb406f2715253e8a93",
                                "answer": "3",
                                "_id": "6715d74ca28f6d0d6b7e9961"
                            },
                            {
                                "questionId": "669a476a406f2715253e8aaf",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e9962"
                            },
                            {
                                "questionId": "669a477b406f2715253e8ab5",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9963"
                            },
                            {
                                "questionId": "669a478e406f2715253e8abb",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e9964"
                            },
                            {
                                "questionId": "669a46dc406f2715253e8a99",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9965"
                            },
                            {
                                "questionId": "669a4592406f2715253e8a5d",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9966"
                            }
                        ],
                        "isFilled": true,
                        "_id": "6715d74ca28f6d0d6b7e995d"
                    },
                    {
                        "respondentName": "Teacher Respondent 1",
                        "respondentEmail": "dmsaketk@gmail.com",
                        "category": "6713b886d4ad96825deb7993",
                        "responses": [
                            {
                                "questionId": "669a4537406f2715253e8a51",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e9968"
                            },
                            {
                                "questionId": "669a4555406f2715253e8a57",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e9969"
                            },
                            {
                                "questionId": "669a46b7406f2715253e8a8d",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e996a"
                            },
                            {
                                "questionId": "669a46cb406f2715253e8a93",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e996b"
                            },
                            {
                                "questionId": "669a476a406f2715253e8aaf",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e996c"
                            },
                            {
                                "questionId": "669a477b406f2715253e8ab5",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e996d"
                            },
                            {
                                "questionId": "669a478e406f2715253e8abb",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e996e"
                            },
                            {
                                "questionId": "669a46dc406f2715253e8a99",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e996f"
                            },
                            {
                                "questionId": "669a4592406f2715253e8a5d",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9970"
                            }
                        ],
                        "isFilled": true,
                        "_id": "6715d74ca28f6d0d6b7e9967"
                    },
                    {
                        "respondentName": "Parent Resondent 1",
                        "respondentEmail": "jsakjsd@gmail.com",
                        "category": "6713b88ed4ad96825deb7996",
                        "responses": [
                            {
                                "questionId": "669a4537406f2715253e8a51",
                                "answer": "4",
                                "_id": "6715d74ca28f6d0d6b7e9972"
                            },
                            {
                                "questionId": "669a4555406f2715253e8a57",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9973"
                            },
                            {
                                "questionId": "669a46b7406f2715253e8a8d",
                                "answer": "3",
                                "_id": "6715d74ca28f6d0d6b7e9974"
                            },
                            {
                                "questionId": "669a46cb406f2715253e8a93",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9975"
                            },
                            {
                                "questionId": "669a476a406f2715253e8aaf",
                                "answer": "0",
                                "_id": "6715d74ca28f6d0d6b7e9976"
                            },
                            {
                                "questionId": "669a477b406f2715253e8ab5",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e9977"
                            },
                            {
                                "questionId": "669a478e406f2715253e8abb",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9978"
                            },
                            {
                                "questionId": "669a46dc406f2715253e8a99",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9979"
                            },
                            {
                                "questionId": "669a4592406f2715253e8a5d",
                                "answer": "0",
                                "_id": "6715d74ca28f6d0d6b7e997a"
                            }
                        ],
                        "isFilled": true,
                        "_id": "6715d74ca28f6d0d6b7e9971"
                    },
                    {
                        "respondentName": "Parent Resondent 2",
                        "respondentEmail": "dmsaketk@gmail.com",
                        "category": "6713b88ed4ad96825deb7996",
                        "responses": [
                            {
                                "questionId": "669a4537406f2715253e8a51",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e997c"
                            },
                            {
                                "questionId": "669a4555406f2715253e8a57",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e997d"
                            },
                            {
                                "questionId": "669a46b7406f2715253e8a8d",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e997e"
                            },
                            {
                                "questionId": "669a46cb406f2715253e8a93",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e997f"
                            },
                            {
                                "questionId": "669a476a406f2715253e8aaf",
                                "answer": "7",
                                "_id": "6715d74ca28f6d0d6b7e9980"
                            },
                            {
                                "questionId": "669a477b406f2715253e8ab5",
                                "answer": "6",
                                "_id": "6715d74ca28f6d0d6b7e9981"
                            },
                            {
                                "questionId": "669a478e406f2715253e8abb",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e9982"
                            },
                            {
                                "questionId": "669a46dc406f2715253e8a99",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e9983"
                            },
                            {
                                "questionId": "669a4592406f2715253e8a5d",
                                "answer": "5",
                                "_id": "6715d74ca28f6d0d6b7e9984"
                            }
                        ],
                        "isFilled": true,
                        "_id": "6715d74ca28f6d0d6b7e997b"
                    }
                ],
                "_id": "6715d6c6a28f6d0d6b7e9933"
            }
        ]
    }
]

subjectObject =[
    {
        "subjectPhone": "",
        "subjectName": "Subject Survey",
        "subjectEmail": "saket1996225@gmail.com",
        "responses": [
            {
                "questionId": "669a4537406f2715253e8a51",
                "answer": "4",
                "_id": "6715d6c6a28f6d0d6b7e9934"
            },
            {
                "questionId": "669a4555406f2715253e8a57",
                "answer": "5",
                "_id": "6715d6c6a28f6d0d6b7e9935"
            },
            {
                "questionId": "669a46b7406f2715253e8a8d",
                "answer": "7",
                "_id": "6715d6c6a28f6d0d6b7e9936"
            },
            {
                "questionId": "669a46cb406f2715253e8a93",
                "answer": "7",
                "_id": "6715d6c6a28f6d0d6b7e9937"
            },
            {
                "questionId": "669a476a406f2715253e8aaf",
                "answer": "6",
                "_id": "6715d6c6a28f6d0d6b7e9938"
            },
            {
                "questionId": "669a477b406f2715253e8ab5",
                "answer": "7",
                "_id": "6715d6c6a28f6d0d6b7e9939"
            },
            {
                "questionId": "669a478e406f2715253e8abb",
                "answer": "5",
                "_id": "6715d6c6a28f6d0d6b7e993a"
            },
            {
                "questionId": "669a46dc406f2715253e8a99",
                "answer": "6",
                "_id": "6715d6c6a28f6d0d6b7e993b"
            },
            {
                "questionId": "669a4592406f2715253e8a5d",
                "answer": "6",
                "_id": "6715d6c6a28f6d0d6b7e993c"
            }
        ],
        "isFilled": true,
        "respondent": [
            {
                "respondentName": "Peer Respondent 1",
                "respondentEmail": "jsakjsd@gmail.com",
                "category": "6713b87cd4ad96825deb7990",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e994a"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e994b"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "0",
                        "_id": "6715d74ca28f6d0d6b7e994c"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e994d"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e994e"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e994f"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9950"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "3",
                        "_id": "6715d74ca28f6d0d6b7e9951"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9952"
                    }
                ],
                "isFilled": true,
                "_id": "6715d74ca28f6d0d6b7e9949"
            },
            {
                "respondentName": "Peer Respondent 1",
                "respondentEmail": "dmsaketk@gmail.com",
                "category": "6713b87cd4ad96825deb7990",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9954"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9955"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9956"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9957"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9958"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9959"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e995a"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e995b"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e995c"
                    }
                ],
                "isFilled": true,
                "_id": "6715d74ca28f6d0d6b7e9953"
            },
            {
                "respondentName": "Teacher Respondent 1",
                "respondentEmail": "jsakjsd@gmail.com",
                "category": "6713b886d4ad96825deb7993",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e995e"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e995f"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e9960"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "3",
                        "_id": "6715d74ca28f6d0d6b7e9961"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e9962"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9963"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e9964"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9965"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9966"
                    }
                ],
                "isFilled": true,
                "_id": "6715d74ca28f6d0d6b7e995d"
            },
            {
                "respondentName": "Teacher Respondent 1",
                "respondentEmail": "dmsaketk@gmail.com",
                "category": "6713b886d4ad96825deb7993",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e9968"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e9969"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e996a"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e996b"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e996c"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e996d"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e996e"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e996f"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9970"
                    }
                ],
                "isFilled": true,
                "_id": "6715d74ca28f6d0d6b7e9967"
            },
            {
                "respondentName": "Parent Resondent 1",
                "respondentEmail": "jsakjsd@gmail.com",
                "category": "6713b88ed4ad96825deb7996",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "4",
                        "_id": "6715d74ca28f6d0d6b7e9972"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9973"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "3",
                        "_id": "6715d74ca28f6d0d6b7e9974"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9975"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "0",
                        "_id": "6715d74ca28f6d0d6b7e9976"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e9977"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9978"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9979"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "0",
                        "_id": "6715d74ca28f6d0d6b7e997a"
                    }
                ],
                "isFilled": true,
                "_id": "6715d74ca28f6d0d6b7e9971"
            },
            {
                "respondentName": "Parent Resondent 2",
                "respondentEmail": "dmsaketk@gmail.com",
                "category": "6713b88ed4ad96825deb7996",
                "responses": [
                    {
                        "questionId": "669a4537406f2715253e8a51",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e997c"
                    },
                    {
                        "questionId": "669a4555406f2715253e8a57",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e997d"
                    },
                    {
                        "questionId": "669a46b7406f2715253e8a8d",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e997e"
                    },
                    {
                        "questionId": "669a46cb406f2715253e8a93",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e997f"
                    },
                    {
                        "questionId": "669a476a406f2715253e8aaf",
                        "answer": "7",
                        "_id": "6715d74ca28f6d0d6b7e9980"
                    },
                    {
                        "questionId": "669a477b406f2715253e8ab5",
                        "answer": "6",
                        "_id": "6715d74ca28f6d0d6b7e9981"
                    },
                    {
                        "questionId": "669a478e406f2715253e8abb",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e9982"
                    },
                    {
                        "questionId": "669a46dc406f2715253e8a99",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e9983"
                    },
                    {
                        "questionId": "669a4592406f2715253e8a5d",
                        "answer": "5",
                        "_id": "6715d74ca28f6d0d6b7e9984"
                    }
                ],
                "isFilled": true,
                "_id": "6715d74ca28f6d0d6b7e997b"
            }
        ],
        "_id": "6715d6c6a28f6d0d6b7e9933"
    }
]

the table created by renderTraitTable() I want to have a column named "Others_Average" which will contain the [sum of all categories except 'Self' / length of all categories]. But I want to have all the  previous functionality as well


In the current scenario, renderTraitTable() prints the following table: - 

Trait	    Self	Peer	Teacher	    Parent	    Others
Trait 01	5.0	    5.7	    5.0	        5.5	        33.09
Trait 03	6.7	    6.0	    5.5	        5.8	        33.17
Trait 04	6.0	    6.2	    4.8	        6.2	        32.82

But I want to modify the above table in the following:- 

Trait	    Self	Peer	Teacher	    Parent	AverageOfCategories    Others
Trait 01	5.0	    5.7	    5.0	        5.5	        5.4                 33.09
Trait 03	6.7	    6.0	    5.5	        5.8	        5.7                 33.17
Trait 04	6.0	    6.2	    4.8	        6.2	        5.7                 32.82


In the table the column AverageOfCategories holds the average of categories (like Peer, Teacher, Parent) except self

Also, I want  AverageOfCategories column should be reflected in the bar graph