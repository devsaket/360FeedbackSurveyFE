import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col
} from "reactstrap";
import Header from "components/Headers/Header.js";
import DonutChart from './Charts/DonutChart';
import SimpleDonutChart from './Charts/SimpleDonutChart';
import RadarGraph from './Charts/RadarChart';
import ProgressBar from './Charts/ProgressBar';
import CompanyLogo from '../../assets/img/company/CompanyLogo.jpg'
import { SurveyTraitsData } from './SurveyTraitsData';
import SurveyResponseRespondentList from './SurveyResponseRespondentList';
import SurveyTraitsRespondentScore from './SurveyTraitsRespondentScore';
import SurveyTraitsSelfScore from './SurveyTraitsSelfScore';
import SurveyTraitWiseAnalysis from './SurveyTraitWiseAnalysis';

const SurveyAnalysis = () => {
    const { id, subjectId } = useParams();

    const [surveyResponseObject, setSurveyResponseObject] = useState([]);
    const [surveyObject, setSurveyObject] = useState([]);
    const [subjectObject, setSubjectObject] = useState([]);
    const [categoriesRolesObject, setCategoryRolesObject] = useState([]);
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

                const questionResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/');
                setQuestionObjects(questionResponse.data);

                const traitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/');
                setTraitDetails(traitResponse.data);

                const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`);
                setSurveyObject(surveyResponse.data);

                const surveyResultResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response/${id}`);
                setSurveyResponseObject(surveyResultResponse.data);

                const surveyResultSubjectDataResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response?surveyId=${id}&subjectId=${subjectId}`);
                setSubjectObject(surveyResultSubjectDataResponse.data);
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
                            // if (!traitQuestionData[trait][response.questionId].responses[categoryName]) {
                            //     traitQuestionData[trait][response.questionId].responses[categoryName] = [];
                            // }
                            // traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10) || 0);
                            traitQuestionData[trait][response.questionId].responses.push(parseInt(response.answer, 10) || 0);
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
                                // if (!traitQuestionData[trait][response.questionId].responses[categoryName]) {
                                //     traitQuestionData[trait][response.questionId].responses[categoryName] = [];
                                // }
                                // traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10) || 0);
                                traitQuestionData[trait][response.questionId].responses.push(parseInt(response.answer, 10) || 0);
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
                            completionRate: ((completed / nominated) * 100)
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
        setSummaryData(summaryData);
        setTraitData(processedTraitData);
        setCategoryTraitData(processedCategoryTraitData);
        setTraitCategoryData(processedTraitCategoryData);
        setTraitSelfOthersData(processTraitSelfOthersData(processedTraitCategoryData));
        setTraitRespondentsData(processTraitRespondentsData(processedTraitCategoryData));
        setTraitQuestionData(traitQuestionData);
        console.log(traitQuestionData);
    }, [loading, subjectId, subjectObject, surveyObject, surveyResponseObject, categoriesRolesObject, questionObjects]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const radarChartData = categoryTraitData.reduce((acc, item) => {
        item.traits.forEach(trait => {
            let existingTrait = acc.find(tra => tra.trait === trait.trait);
            if (!existingTrait) {
                existingTrait = { trait: trait.trait };
                acc.push(existingTrait);
            }
            existingTrait[item.category] = parseFloat(trait.averageScore);
        });
        // console.log("acc = ",acc);
        return acc;
    }, []);

    const getTopAndBottomQuestions = (trait) => {
        const questions = traitQuestionData[trait];
        const sortedQuestions = Object.keys(questions).map(questionId => {
            const details = questions[questionId];
            const averageResponse = details.responses.reduce((acc, score) => acc + score, 0) / details.responses.length;
            return {
                questionText: details.questionText,
                averageResponse
            };
        }).sort((a, b) => b.averageResponse - a.averageResponse);

        const topQuestions = sortedQuestions.filter(q => q.averageResponse >= 6).slice(0, 5);
        const bottomQuestions = sortedQuestions.filter(q => q.averageResponse < 4).slice(0, 5);

        return { topQuestions, bottomQuestions };
    };


    const getTopAndBottomSubjectQuestions = (subject) => {
        const responses = subject.responses.filter(response => response.answer > 0); // Filter out responses with 0
        const sortedResponses = responses.map(response => {
            const question = questionObjects.find(q => q._id === response.questionId);
            return {
                questionText: question ? question.question : '',
                response: parseInt(response.answer, 10)
            };
        }).sort((a, b) => b.response - a.response);

        const topQuestions = sortedResponses.slice(0, 5);
        const bottomQuestions = sortedResponses.reverse().slice(0, 5);

        return { topQuestions, bottomQuestions };
    };

    const subject = subjectObject.length ? subjectObject[0] : null;
    const subjectQuestions = subject ? getTopAndBottomSubjectQuestions(subject) : { topQuestions: [], bottomQuestions: [] };

    const getTopAndBottomOthersQuestions = () => {
        const allQuestions = [];

        // Collect all responses excluding those with 0 response
        for (const trait in traitQuestionData) {
            for (const questionId in traitQuestionData[trait]) {
                const questionData = traitQuestionData[trait][questionId];
                const validResponses = questionData.responses.filter(response => response > 0);
                if (validResponses.length > 0) {
                    const averageResponse = validResponses.reduce((acc, score) => acc + score, 0) / validResponses.length;
                    allQuestions.push({
                        questionText: questionData.questionText,
                        averageResponse
                    });
                }
            }
        }

        // Sort questions by average response
        const sortedQuestions = allQuestions.sort((a, b) => b.averageResponse - a.averageResponse);

        // Get top 5 and bottom 5 questions
        const topOtherQuestions = sortedQuestions.slice(0, 5);
        const bottomOtherQuestions = sortedQuestions.slice(-5);

        return { topOtherQuestions, bottomOtherQuestions };
    }

    const { topOtherQuestions, bottomOtherQuestions } = getTopAndBottomOthersQuestions();

    const getTopTraits = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating),
                averageOtherRating: parseFloat(item.averageOtherRating),
                difference: parseFloat(item.selfRating) - parseFloat(item.averageOtherRating)
            };
        });

        const sortedTraits = traitsWithComparison.sort((a, b) => b.difference - a.difference);
        return sortedTraits.slice(0, 5);
    };

    const topTraits = getTopTraits();

    const filterTopTraits = () => {
        return traitSelfOthersData.filter(item => {
            const selfRating = parseFloat(item.selfRating);
            const averageOtherRating = parseFloat(item.averageOtherRating);
            return selfRating > 6 && averageOtherRating > 6;
        });
    };

    const topTraitsOfStrength = filterTopTraits();

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row className="mt--3">
                    <Col>
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Survey Analysis</h3>
                            </CardHeader>
                        </Card>

                        {/* Introduction  */}

                        <Card>
                            <CardBody className='text-center'>
                                {
                                    Array.isArray(surveyObject) && surveyObject.map(surveyItem => {
                                        return <>
                                            <h1 className='display-2 py-3'>{surveyItem.surveyName}</h1>
                                            <img src={CompanyLogo} alt="Company Logo" className='rounded-circle border border-dark border-3' width={200} />
                                        </>
                                    })
                                }

                                <div className='my-5 py-5'>
                                    <h2 className='display-2'>Company Name</h2>
                                    <img src={CompanyLogo} alt="Company Logo" className='rounded-circle border border-dark border-3' width={200} />
                                </div>

                                <div className='my-5 py-5'>
                                    {
                                        Array.isArray(subjectObject) && subjectObject.map(subjectItem => {
                                            return <>
                                                <h3 className='display-2 fw-bold py-3'>Report Generated for <br /> "{subjectItem.subjectName}"</h3>
                                                <p>Date - 22/07/2024</p>
                                            </>
                                        })
                                    }
                                </div>

                            </CardBody>
                        </Card>

                        {/* Copyright and Disclaimer */}
                        <Card>
                            <CardBody>
                                <h3>Copyright</h3>
                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore corrupti quisquam eaque culpa voluptates natus similique sit. Dicta natus, sapiente eaque obcaecati molestiae sequi dolorum facere reiciendis pariatur ut deleniti.</p>
                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore corrupti quisquam eaque culpa voluptates natus similique sit. Dicta natus, sapiente eaque obcaecati molestiae sequi dolorum facere reiciendis pariatur ut deleniti.</p>

                                <h3>Disclaimer</h3>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam porro sequi dolores odio reiciendis delectus quasi asperiores error assumenda labore mollitia soluta enim quos rerum impedit officiis, obcaecati possimus. Tenetur.</p>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam porro sequi dolores odio reiciendis delectus quasi asperiores error assumenda labore mollitia soluta enim quos rerum impedit officiis, obcaecati possimus. Tenetur.</p>
                            </CardBody>
                        </Card>

                        {/* The Company & Expertise */}
                        <Card>
                            <CardBody>
                                <h3>Brief About Company</h3>
                                <p></p>

                                <h3>Team</h3>
                                <p></p>

                                <h3>Features of IT Platform</h3>
                                <p></p>

                                <h3>Unbiased</h3>
                                <p></p>

                                <h3>Evidence Based</h3>
                                <p></p>

                                <h3>Triangulated</h3>
                                <p></p>
                            </CardBody>
                        </Card>

                        {/* About 360 Feedback */}
                        <Card>
                            <CardBody>
                                <h3>Introduction about 360 assessment</h3>
                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque, numquam! Voluptatem quae incidunt repellat natus, culpa, expedita iusto consequatur sequi fugit numquam ullam vitae eaque laudantium tempora facilis ad obcaecati!</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit velit reprehenderit doloribus voluptas at, ea consectetur eos? Minima sequi atque distinctio neque laboriosam quam ducimus fugit. Id repellendus repudiandae hic.</p>
                            </CardBody>
                        </Card>

                        {/* Definition of 12 Traits */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsData surveyDetails={surveyObject} traitData={traitDetails} />
                            </CardBody>
                        </Card>

                        {/* Definition of Rating Scale */}
                        <Card>
                            <CardBody>
                                <h3>Rating Scale Details</h3>
                            </CardBody>
                        </Card>

                        {/* Overview of Respondents & Weightage */}
                        <Card>
                            <CardBody>
                                {/* <h3>Respondents List</h3> */}
                                <SurveyResponseRespondentList surveyResponses={subjectObject} />
                            </CardBody>
                        </Card>

                        {/* Rank Traits based on average of Others rating */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsRespondentScore traitRespondentsData={traitRespondentsData} />
                            </CardBody>
                        </Card>

                        {/* Rank Traits based on average of Self rating */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsSelfScore traitSelfData={traitSelfOthersData} />
                            </CardBody>
                        </Card>

                        {/* Trait Wise Analysis */}
                        <Card>
                            <CardBody>
                                <SurveyTraitWiseAnalysis traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} />
                            </CardBody>
                        </Card>

                        {/* Top 5 & Bottom 5 Questions from self */}
                        <Card>
                            <CardBody>
                                <h2>Top 5 & Bottom 5 Questions from self</h2>
                                {subject && (
                                    <div>
                                        <h2>Subject Specific Questions</h2>
                                        <h4>Top 5 Questions</h4>
                                        <ul>
                                            {subjectQuestions.topQuestions.map((question, idx) => (
                                                <li key={idx}>{question.questionText} - Response: {question.response}</li>
                                            ))}
                                        </ul>
                                        <h4>Bottom 5 Questions</h4>
                                        <ul>
                                            {subjectQuestions.bottomQuestions.map((question, idx) => (
                                                <li key={idx}>{question.questionText} - Response: {question.response}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Top 5 & Bottom 5 Questions from others */}
                        <Card>
                            <CardBody>
                                <h2>Top 5 & Bottom 5 Questions from Others</h2>
                                <h4>Top 5 Questions (Highest Responses)</h4>
                                <ul>
                                    {topOtherQuestions.map((question, idx) => (
                                        <>
                                            {/* <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li> */}
                                            <li key={idx}>{question.questionText}</li>
                                        </>
                                        
                                    ))}
                                </ul>
                                <h4>Bottom 5 Questions (Lowest Responses)</h4>
                                <ul>
                                    {bottomOtherQuestions.map((question, idx) => (
                                        <>
                                            {/* <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li> */}
                                            <li key={idx}>{question.questionText} </li>
                                        </>
                                    ))}
                                </ul>
                            </CardBody>
                        </Card>

                        {/* Top 5 & Bottom 5 Questions from others */}
                        <Card>
                            <CardBody>
                                <h4>Top 5 Traits Compared to Self</h4>
                                <ul>
                                    {topTraits.map((trait, idx) => (
                                        <li key={idx}>
                                            <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating.toFixed(1)}, Average Other Rating: {trait.averageOtherRating.toFixed(1)}, Difference: {trait.difference.toFixed(1)}
                                        </li>
                                    ))}
                                </ul>
                            </CardBody>
                        </Card>

                        {/* Top Traits Average score greter than 6 */}
                        <Card>
                            <CardBody>
                                <h4>Traits denoting your strengths</h4>
                                <ul>
                                    {topTraits.map((trait, idx) => (
                                        <li key={idx}>
                                            <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating.toFixed(1)}, Average Other Rating: {trait.averageOtherRating.toFixed(1)}
                                        </li>
                                    ))}
                                </ul>
                            </CardBody>
                        </Card>

                        

                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default SurveyAnalysis;
