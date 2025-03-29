import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col, Button
} from "reactstrap";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "@hapi/joi";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import TextareaAutosize from 'react-textarea-autosize';

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
import SurveyTopBottom5QuestionsForSelf from './SurveyTopBottom5QuestionsForSelf';
import SurveyTopBottom5QuestionsForOthers from './SurveyTopBottom5QuestionsForOthers';
import SurveyTop5TraitsComparedToSelf from './SurveyTop5TraitsComparedtoSelf';
import SurveyTraitsForStrengths from './SurveyTraitsForStrengths';
import SurveyTraitsUnknownDeficiencies from './SurveyTraitsUnknownDeficiencies';
import SurveyTraitsOpenDeficiencies from './SurveyTraitsOpenDeficiencies';
import SurveyTraitsUnknownStrengths from './SurveyTraitsUnknownStrengths';
import SurveyTraitsHighPotential from './SurveyTraitsHighPotential';
import SurveyTraitMapping from './SurveyTraitMapping';
import SurveyParticipationData from './SurveyParticipationData';

import './SurveyManagement.scss';

const GeneralObservationSchema = Joi.object({
    observation: Joi.string().required()
});

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
    const [generalObservation, setGeneralObservation] = useState("");
    const [generalObservationToggle, setGeneralObservationToggle] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: joiResolver(GeneralObservationSchema),
        defaultValues: { observation: "" }
    });

    const observation = watch("observation", "");

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

                getGeneralObservation();
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

                        // if (responseAnswer > 0) {
                            const trait = getTraitDetails(response.questionId);
                            if (trait) {
                                if (!traitScores[trait]) {
                                    traitScores[trait] = { totalScore: 0, count: 0 };
                                }
                                traitScores[trait].totalScore += responseAnswer || 0;
                                traitScores[trait].count += 1;

                                if (!categoryTraitScores[categoryName]) {
                                    categoryTraitScores[categoryName] = {};
                                }
                                if (!categoryTraitScores[categoryName][trait]) {
                                    categoryTraitScores[categoryName][trait] = { totalScore: 0, count: 0 };
                                }
                                categoryTraitScores[categoryName][trait].totalScore += responseAnswer || 0;
                                categoryTraitScores[categoryName][trait].count += 1;

                                if (!traitCategoryScores[trait]) {
                                    traitCategoryScores[trait] = {};
                                }
                                if (!traitCategoryScores[trait][categoryName]) {
                                    traitCategoryScores[trait][categoryName] = { totalScore: 0, count: 0 };
                                }
                                traitCategoryScores[trait][categoryName].totalScore += responseAnswer || 0;
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

                                // traitQuestionData[trait][response.questionId].responses[categoryName].push(responseAnswer || 0);
                                if (responseAnswer > 0) {
                                    traitQuestionData[trait][response.questionId].responses[categoryName].push(responseAnswer);
                                }
                                // traitQuestionData[trait][response.questionId].responses.push(responseAnswer || 0);
                            // }
                        }
                    }
                    );

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
                            const responseAnswer = parseInt(response.answer, 10);

                            // if (responseAnswer > 0) {
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
                                // }
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

    const getGeneralObservation = async () => {
        const generalObservationResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response/subject/general-observation/${id}/${subjectId}`);
        setGeneralObservation(generalObservationResponse.data.observation);

        if (generalObservationResponse.data.observation === '') {
            setGeneralObservationToggle(true);
        } else {
            setGeneralObservationToggle(false);
        }
    }

    const onSubmit = (data) => {
        data = { surveyId: id, subjectId, ...data }
        console.log(data)
        axios.post(process.env.REACT_APP_BACKEND_URL + '/survey-response/subject/general-observation', data)
            .then((res) => {
                if (res.data.status === 200) {
                    reset({ observation: "" });
                    toast.success("General Observation Submitted Successfully!");
                    getGeneralObservation();
                } else {
                    toast.warn("Something Went Wrong!");
                    getGeneralObservation();
                }
            })
            .catch((err) => console.log(err?.message));
    }

    const handleDocumentPrint = () => {
        window.print();
    }

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
                    <Col>
                        <Card className="shadow report-page-header">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Survey Analysis</h3>
                            </CardHeader>
                        </Card>

                        {/* Introduction  */}

                        <Card className='a4'>
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
                        <Card className='a4'>
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
                        {/* <Card>
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
                        </Card> */}

                        {/* 360-Degree Assessment: An Introduction */}
                        <Card className='a4'>
                            <CardBody>
                                <h3 className='display-4 fw-bold py-3'>360-Degree Assessment: An Introduction</h3>
                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque, numquam! Voluptatem quae incidunt repellat natus, culpa, expedita iusto consequatur sequi fugit numquam ullam vitae eaque laudantium tempora facilis ad obcaecati!</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit velit reprehenderit doloribus voluptas at, ea consectetur eos? Minima sequi atque distinctio neque laboriosam quam ducimus fugit. Id repellendus repudiandae hic.</p>
                            </CardBody>
                        </Card>

                        {/* About This Survey */}
                        <Card className='a4'>
                            <CardBody>
                                {
                                    Array.isArray(surveyObject) && surveyObject.map(surveyItem => {
                                        return <>
                                            <h3 className='display-4 fw-bold py-3'>"About this {surveyItem.surveyName}"</h3>
                                            <p>{surveyItem.surveyDescription}</p>
                                        </>
                                    })
                                }

                            </CardBody>
                        </Card>

                        {/* About This Feedback Survey */}
                        {/* <Card>
                            <CardBody>
                                {
                                    Array.isArray(subjectObject) && subjectObject.map(subjectItem => {
                                        return <>
                                            <h3 className='display-4 fw-bold py-3'>"About this Feedback Survey: {subjectItem.subjectName}"</h3>
                                        </>
                                    })
                                }
                                <p>The content of this section can include features of the platform and its uniqueness – Unbiased, Evidence based, Triangulated etc. and also about the rating scale that 1 to 7, etc.</p>
                            </CardBody>
                        </Card> */}

                        {/* Definition of 12 Traits */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsData surveyDetails={surveyObject} traitData={traitDetails} />
                            </CardBody>
                        </Card>

                        {/* Survey Participation Data */}
                        <Card className='a4'>
                            <SurveyParticipationData summaryData={summaryData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                        </Card>

                        {/* Overview of Respondents & Unable to Rate Weightage */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyResponseRespondentList surveyResponses={subjectObject} />
                            </CardBody>
                        </Card>

                        {/* Rank Traits based on average of Self rating */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsSelfScore traitSelfData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        {/* Rank Traits based on average of Others rating */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsRespondentScore traitRespondentsData={traitRespondentsData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>




                        {/* Detailed Trait Analysis */}
                        <Card className='card a4 large-content'>
                            <CardBody>
                                <SurveyTraitWiseAnalysis traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>


                        {/* Top 5 & Bottom 5 Questions from self */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTopBottom5QuestionsForSelf subjectObject={subjectObject} questionObjects={questionObjects} />
                            </CardBody>
                        </Card>

                        {/* Top 5 & Bottom 5 Questions from others */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTopBottom5QuestionsForOthers traitQuestionData={traitQuestionData} />
                            </CardBody>
                        </Card>

                        {/* Top 5 Traits Compared to Self | Hidden Traits with Developmental Needs */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTop5TraitsComparedToSelf traitSelfOthersData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        {/* Top Traits Average score greter than 5 | Trait of Strengths */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsForStrengths traitSelfOthersData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        {/* Unknown Deficiency with difference of 1 in selfRating & averageOtherRating | Blind Traits with Developmental Needs */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsUnknownDeficiencies traitSelfOthersData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        {/* Open Deficiency with selfRating & averageOtherRating is less than 4 | Traits with High Developmental Need */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsOpenDeficiencies traitSelfOthersData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        {/* Unknown Strengths with averageOtherRating is greater than 1 from the selfRating */}
                        {/* <Card>
                            <CardBody>
                                <SurveyTraitsUnknownStrengths traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card> */}

                        {/* High Potential Traits in between score of 4 to 5 */}
                        <Card className='a4'>
                            <CardBody>
                                <SurveyTraitsHighPotential traitSelfOthersData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        {/* Mapping of Traits by Developmental Need */}
                        <Card className='my-3 a4'>
                            <CardBody>
                                <SurveyTraitMapping traitSelfOthersData={traitSelfOthersData} traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} surveyCategoryObject={surveyCategoryObject} categoriesRolesObject={categoriesRolesObject} />
                            </CardBody>
                        </Card>

                        <Card className={generalObservationToggle ? 'card-print-toggler' : 'a4'}>
                            <CardHeader>
                                <h4>General Observation</h4>
                            </CardHeader>
                            <CardBody>
                                {
                                    generalObservationToggle ?
                                        <>
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                <label className="form-label mt-2">Trait Description</label>
                                                <TextareaAutosize  {...register("observation")} className="form-control" placeholder="Enter General Observation" minRows={3} maxRows={5}></TextareaAutosize>
                                                {errors.traitDescription && <p className='form-error'>General Observation is Required!</p>}
                                                <Button color="primary" className='px-5 my-2' type="submit" disabled={!observation.trim()}> Submit </Button>
                                            </form>
                                        </> : <>
                                            <pre>{generalObservation}</pre>
                                        </>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row className='download-pdf-button'>
                    <Col className='text-center'>
                        <Link to={`/admin/survey/analysis-ar/${id}/${subjectId}`}><Button color="primary" className='px-5 m-2'><i class="fa-solid fa-square-poll-vertical"></i> Result Arabic</Button></Link>
                        <Button color="success" className='px-5 my-2 download-pdf-button' onClick={handleDocumentPrint} disabled={observation.trim()}> Download as PDF </Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default SurveyAnalysis;
