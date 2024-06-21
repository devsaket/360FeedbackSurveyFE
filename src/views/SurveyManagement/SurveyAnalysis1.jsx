import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row
} from "reactstrap";
import Header from "components/Headers/Header.js";

const SurveyAnalysis1 = () => {
    const { id, subjectId } = useParams();

    const [surveyResponseObject, setSurveyResponseObject] = useState([]);
    const [surveyObject, setSurveyObject] = useState([]);
    const [subjectObject, setSubjectObject] = useState([]);
    const [categoriesRolesObject, setCategoryRolesObject] = useState([]);
    const [questionObjects, setQuestionObjects] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                const categoryResponse = await axios.get('http://localhost:5454/api/v1/categoryRoles/');
                setCategoryRolesObject(categoryResponse.data);

                const questionResponse = await axios.get('http://localhost:5454/api/v1/question/');
                setQuestionObjects(questionResponse.data);

                const surveyResponse = await axios.get(`http://localhost:5454/api/v1/survey?id=${id}`);
                setSurveyObject(surveyResponse.data);

                const surveyResultResponse = await axios.get(`http://localhost:5454/api/v1/survey-response/${id}`);
                setSurveyResponseObject(surveyResultResponse.data);

                const surveyResultSubjectDataResponse = await axios.get(`http://localhost:5454/api/v1/survey-response?surveyId=${id}&subjectId=${subjectId}`);
                setSubjectObject(surveyResultSubjectDataResponse.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyData();
    }, [id]);

    // Utility function to get the category name by ID
    const getCategoryName = (categoryId) => {
        const category = categoriesRolesObject.find(cat => cat._id === categoryId);
        return category ? category.categoryName : '';
    };

    // Utility function to get the score weightage by category ID
    const getScoreWeightage = (categoryId) => {
        const category = surveyObject[0].categories.find(cat => cat.category === categoryId);
        return category ? category.scoreWeightage : 0;
    };

    // Transforming data into the required table format
    const transformData = () => {
        const survey = surveyObject[0];
        const questions = survey.questions;
        const transformedData = [];

        surveyResponseObject.forEach(response => {
            const subject = response.subject[0];
            const subjectRow = {
                surveySubmittedBy: subject.subjectName,
                responses: subject.responses,
                categoryName: 'Self',
                scoreWeightage: 100,
                totalScore: subject.responses.reduce((acc, res) => acc + (parseInt(res.answer) || 0), 0),
                averageScore: subject.responses.reduce((acc, res) => acc + (parseInt(res.answer) || 0), 0),
            };
            transformedData.push(subjectRow);

            const categoryRespondents = {};
            subject.respondent.forEach(respondent => {
                const categoryName = getCategoryName(respondent.category);
                const scoreWeightage = getScoreWeightage(respondent.category);

                if (!categoryRespondents[categoryName]) {
                    categoryRespondents[categoryName] = {
                        surveySubmittedBy: respondent.respondentName,
                        responses: respondent.responses,
                        categoryName,
                        scoreWeightage,
                        totalScore: respondent.responses.reduce((acc, res) => acc + (parseInt(res.answer) || 0), 0),
                        respondentCount: 1,
                    };
                } else {
                    categoryRespondents[categoryName].totalScore += respondent.responses.reduce((acc, res) => acc + (parseInt(res.answer) || 0), 0);
                    categoryRespondents[categoryName].respondentCount += 1;
                }
            });

            Object.values(categoryRespondents).forEach(data => {
                data.averageScore = data.totalScore / data.respondentCount;
                transformedData.push(data);
            });
        });

        return transformedData;
    };


    // useEffect(() => {
    //     if (loading || !surveyObject.length || !surveyResponseObject.length) return;

    //     // Map categories by their ID for quick lookup
    //     const categoriesMap = Object.fromEntries(categoriesRolesObject.map(cat => [cat._id, cat]));

    //     // Get survey details
    //     const survey = surveyObject[0];
    //     if (!survey) return;

    //     const surveyQuestions = survey.questions;
    //     const surveyCategories = survey.categories;

    //     // Helper function to get score weightage
    //     const getCategoryScoreWeightage = categoryId => {
    //         const category = surveyCategories.find(cat => cat.category === categoryId);
    //         return category ? category.scoreWeightage : 100;
    //     };

    //     // Helper function to calculate average score
    //     const calculateAverageScore = (responses, weightage) => {
    //         const totalScore = responses.reduce((acc, response) => acc + parseFloat(response.answer), 0);
    //         return ((totalScore / (3 * 7)) / (weightage / 100)).toFixed(2); // Assuming max score for each question is 7
    //     };

    //     // Process survey responses
    //     const processedData = [];

    //     // Subject responses
    //     surveyResponseObject.forEach(surveyResponse => {
    //         const subject = surveyResponse.subject;
    //         const subjectResponses = subject.responses;

    //         processedData.push({
    //             name: subject.subjectName,
    //             question1: subjectResponses[0]?.answer || "",
    //             question2: subjectResponses[1]?.answer || "",
    //             question3: subjectResponses[2]?.answer || "",
    //             category: "Self",
    //             scoreWeightage: 100,
    //             averageScore: calculateAverageScore(subjectResponses, 100)
    //         });

    //         // Respondent responses
    //         surveyResponse.respondent.forEach(respondent => {
    //             const respondentCategory = categoriesMap[respondent.category]?.categoryName || "Unknown";
    //             const scoreWeightage = getCategoryScoreWeightage(respondent.category);

    //             processedData.push({
    //                 name: respondent.respondentName,
    //                 question1: respondent.responses[0]?.answer || "",
    //                 question2: respondent.responses[1]?.answer || "",
    //                 question3: respondent.responses[2]?.answer || "",
    //                 category: respondentCategory,
    //                 scoreWeightage: scoreWeightage,
    //                 averageScore: calculateAverageScore(respondent.responses, scoreWeightage)
    //             });
    //         });
    //     });

    //     setTableData(processedData);
    // }, [loading, surveyObject, surveyResponseObject, categoriesRolesObject, questionObjects]);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // if (error) {
    //     return <div>Error: {error.message}</div>;
    // }

    // Function to process data
    // const processData = () => {
    //     // Extracting the survey
    //     const survey = surveyObject[0];

    //     // Extracting questions and mapping them to a format for easy lookup
    //     const questionsMap = {};
    //     survey.questions.forEach((questionId, index) => {
    //         const question = questionObjects.find(q => q._id === questionId);
    //         questionsMap[questionId] = {
    //             code: question.questionCode,
    //             index: index + 1
    //         };
    //     });

    //     // Extracting categories and mapping them to a format for easy lookup
    //     const categoriesMap = {};
    //     survey.categories.forEach(cat => {
    //         const category = categoriesRolesObject.find(c => c._id === cat.category);
    //         categoriesMap[cat.category] = {
    //             name: category.categoryName,
    //             scoreWeightage: cat.scoreWeightage
    //         };
    //     });

    //     // Processing the survey responses
    //     const tableDataSet = [];

    //     surveyResponseObject.forEach(response => {
    //         response.subject.forEach(subject => {
    //             // Process subject responses
    //             const subjectData = {
    //                 surveySubmittedBy: subject.subjectName,
    //                 categoryName: 'Self',
    //                 scoreWeightage: 100,
    //                 responses: {},
    //                 totalScore: 0
    //             };

    //             subject.responses.forEach(r => {
    //                 const questionInfo = questionsMap[r.questionId];
    //                 subjectData.responses[`Question${questionInfo.index}`] = r.answer;
    //                 subjectData.totalScore += parseInt(r.answer, 10);
    //             });

    //             subjectData.averageScore = subjectData.totalScore;
    //             tableDataSet.push(subjectData);

    //             // Process respondent responses
    //             subject.respondent.forEach(respondent => {
    //                 const respondentData = {
    //                     surveySubmittedBy: respondent.respondentName,
    //                     categoryName: categoriesMap[respondent.category].name,
    //                     scoreWeightage: categoriesMap[respondent.category].scoreWeightage,
    //                     responses: {},
    //                     totalScore: 0
    //                 };

    //                 respondent.responses.forEach(r => {
    //                     const questionInfo = questionsMap[r.questionId];
    //                     respondentData.responses[`Question${questionInfo.index}`] = r.answer;
    //                     respondentData.totalScore += parseInt(r.answer, 10);
    //                 });

    //                 respondentData.averageScore = respondentData.totalScore;
    //                 tableDataSet.push(respondentData);
    //             });
    //         });
    //     });

    //     // Calculate average scores for respondents with same category
    //     const categoryScores = {};

    //     tableDataSet.forEach(data => {
    //         if (data.categoryName !== 'Self') {
    //             if (!categoryScores[data.categoryName]) {
    //                 categoryScores[data.categoryName] = [];
    //             }
    //             categoryScores[data.categoryName].push(data.totalScore);
    //         }
    //     });

    //     Object.keys(categoryScores).forEach(categoryName => {
    //         const scores = categoryScores[categoryName];
    //         const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

    //         tableDataSet.forEach(data => {
    //             if (data.categoryName === categoryName) {
    //                 data.averageScore = averageScore;
    //             }
    //         });
    //     });

    //     setTableData(tableDataSet);
    // };


    useEffect(() => {
        if (loading || !surveyObject.length || !surveyResponseObject.length) return;
        // processData();
        transformData();
        setTableData(transformData());
    }, [loading, surveyObject, surveyResponseObject, categoriesRolesObject, questionObjects])

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Survey Analysis</h3>
                            </CardHeader>
                            <CardBody>
                                
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
}

export default SurveyAnalysis1;
