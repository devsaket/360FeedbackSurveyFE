import { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

// reactstrap components
import {
    Card, Col,
    CardHeader,
    CardBody,
    Container,
    Row, Button
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import { exportToExcel } from '../../views/SurveyManagementArabic/excelUtils';
import SurveyParticipationDataArabic from "views/SurveyManagementArabic/SurveyParticipationDataArabic";

const SurveyResultSubjectRespondentResponse = () => {
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
    const [generalObservation, setGeneralObservation] = useState("");
    const [generalObservationToggle, setGeneralObservationToggle] = useState(false);


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
                        const responseAnswer = parseInt(response.answer, 10);
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
                            // traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10) || 0);
                            if(responseAnswer > 0){
                                traitQuestionData[trait][response.questionId].responses[categoryName].push(response.answer);
                            }
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

                                if (parseInt(response.answer, 10) > 0) {
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
    return (
        <>
            {/* <Header /> */}
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                {/* <h3 className="mb-0">Survey Result</h3> */}
                                <h3 className="mb-0" dir="rtl">نتائج المقياس</h3>
                                <div>
                                    {/* <Button onClick={handleDownload}>Download Excel</Button> */}
                                    {/* <Link to={`/website/survey-analysis/${id}/${subjectId}`} className="btn btn-lg btn-primary">
                                        <i className="fa-solid fa-square-poll-vertical"></i> Result Analysis
                                    </Link> */}
                                    <Link to={`/website/survey-analysis/${id}/${subjectId}`} className="btn btn-lg btn-primary">
                                        <i className="fa-solid fa-square-poll-vertical"></i>تحليل النتيجة
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <SurveyParticipationDataArabic summaryData={summaryData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>
                    </div>
                </Row>
                <Row>
                    <Col className="text-center">
                        {/* <Link to={`/admin/survey/analysis/${surveyId}/${subjectId}`} className="btn btn-lg btn-primary"><i className="fa-solid fa-square-poll-vertical"></i> Old Analysis</Link> */}
                        {/* <Link to={`/website/survey-analysis/${id}/${subjectId}`} className="btn btn-lg btn-primary"><i className="fa-solid fa-square-poll-vertical"></i> Result Analysis</Link> */}
                        <Link to={`/website/survey-analysis/${id}/${subjectId}`} className="btn btn-lg btn-primary" dir="rtl"><i className="fa-solid fa-square-poll-vertical"></i> تحليل النتيجة</Link>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default SurveyResultSubjectRespondentResponse;

