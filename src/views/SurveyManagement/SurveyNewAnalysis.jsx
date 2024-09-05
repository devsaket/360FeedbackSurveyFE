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
import SurveyTopBottom5QuestionsForSelf from './SurveyTopBottom5QuestionsForSelf';
import SurveyTopBottom5QuestionsForOthers from './SurveyTopBottom5QuestionsForOthers';
import SurveyTop5TraitsComparedToSelf from './SurveyTop5TraitsComparedtoSelf';
import SurveyTraitsForStrengths from './SurveyTraitsForStrengths';
import SurveyTraitsUnknownDeficiencies from './SurveyTraitsUnknownDeficiencies';
import SurveyTraitsOpenDeficiencies from './SurveyTraitsOpenDeficiencies';
import SurveyTraitsUnknownStrengths from './SurveyTraitsUnknownStrengths';
import SurveyTraitsHighPotential from './SurveyTraitsHighPotential';

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
        console.log(summaryData);
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
                        <Card>
                            <CardBody>
                                <h3 className='display-4 fw-bold py-3'>360-Degree Assessment: An Introduction</h3>
                                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque, numquam! Voluptatem quae incidunt repellat natus, culpa, expedita iusto consequatur sequi fugit numquam ullam vitae eaque laudantium tempora facilis ad obcaecati!</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit velit reprehenderit doloribus voluptas at, ea consectetur eos? Minima sequi atque distinctio neque laboriosam quam ducimus fugit. Id repellendus repudiandae hic.</p>
                            </CardBody>
                        </Card>

                        {/* About This Feedback Survey */}
                        <Card>
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
                        </Card>

                        {/* Definition of 12 Traits */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsData surveyDetails={surveyObject} traitData={traitDetails} />
                            </CardBody>
                        </Card>

                        {/* Survey Participation Data */}
                        <Card>
                            <CardHeader>
                                <h3>Survey Participation Data</h3>
                            </CardHeader>
                            <CardBody>
                                <p>The following is a summary of the group of respondents who were invited to participate and provide feedback for you.</p>
                                <table className='table table-bordered'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th className='text-wrap align-top text-start'><b className='text-white'>Relationship</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Nominated</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Completed</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Completion Rate</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(summaryData) && summaryData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.category}</td>
                                                <td className='text-wrap align-top text-center'>{row.nominated}</td>
                                                <td className='text-wrap align-top text-center'>{row.completed}</td>
                                                <td className='d-flex align-items-center justify-content-center'>
                                                    {/* <progress value={row.completionRate}  max={100} className='w-100' /><span className='px-2'>{row.completionRate}%</span>  */}
                                                    <ProgressBar bgcolor="#6a1b9a" completed={row.completionRate} max={100} /> 
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card>

                        {/* Overview of Respondents & Unable to Rate Weightage */}
                        <Card>
                            <CardBody>
                                <SurveyResponseRespondentList surveyResponses={subjectObject} />
                            </CardBody>
                        </Card>

                        <div className="row">
                            <div className="col-6">
                                {/* Rank Traits based on average of Others rating */}
                                <Card>
                                    <CardBody>
                                        <SurveyTraitsRespondentScore traitRespondentsData={traitRespondentsData} />
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-6">
                                {/* Rank Traits based on average of Self rating */}
                                <Card>
                                    <CardBody>
                                        <SurveyTraitsSelfScore traitSelfData={traitSelfOthersData} />
                                    </CardBody>
                                </Card>
                            </div>
                        </div>

                        {/* Detailed Trait Analysis */}
                        <Card>
                            <CardBody>
                                <SurveyTraitWiseAnalysis traitCategoryData={traitCategoryData} traitData={traitData} traitQuestionData={traitQuestionData} />
                            </CardBody>
                        </Card>

                        <div className="row">
                            <div className="col-6">
                                {/* Top 5 & Bottom 5 Questions from self */}
                                <Card>
                                    <CardBody>
                                        <SurveyTopBottom5QuestionsForSelf subjectObject={subjectObject} questionObjects={questionObjects} />
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-6">
                                {/* Top 5 & Bottom 5 Questions from others */}
                                <Card>
                                    <CardBody>
                                        <SurveyTopBottom5QuestionsForOthers traitQuestionData={traitQuestionData} />
                                    </CardBody>
                                </Card>
                            </div>
                        </div>

                        

                        

                        {/* Top 5 Traits Compared to Self | Hidden Traits with Developmental Needs */}
                        <Card>
                            <CardBody>
                                <SurveyTop5TraitsComparedToSelf traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card>

                        {/* Top Traits Average score greter than 5 | Trait of Strengths */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsForStrengths traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card>

                        {/* Unknown Deficiency with difference of 1 in selfRating & averageOtherRating | Blind Traits with Developmental Needs */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsUnknownDeficiencies traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card>

                        {/* Open Deficiency with selfRating & averageOtherRating is less than 4 */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsOpenDeficiencies traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card>

                        {/* Unknown Strengths with averageOtherRating is greater than 1 from the selfRating */}
                        {/* <Card>
                            <CardBody>
                                <SurveyTraitsUnknownStrengths traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card> */}

                        {/* High Potential Traits in between score of 4 to 5 */}
                        <Card>
                            <CardBody>
                                <SurveyTraitsHighPotential traitSelfOthersData={traitSelfOthersData} />
                            </CardBody>
                        </Card>

                        <div className="row">
                            <div className="col-12">
                                <h3>Mapping of Traits by Developmental Need</h3>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <Card>
                                    <CardBody>
                                        <SurveyTraitsForStrengths traitSelfOthersData={traitSelfOthersData} />
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <Card>
                                    <CardBody>
                                        <SurveyTraitsHighPotential traitSelfOthersData={traitSelfOthersData} />
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <Card>
                                    <CardBody>
                                        <SurveyTraitsOpenDeficiencies traitSelfOthersData={traitSelfOthersData} />
                                    </CardBody>
                                </Card>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <h4>General Observation</h4>
                            </CardHeader>
                            <CardBody>
                                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nobis repudiandae ipsum, eveniet iusto quod quas qui iste quae necessitatibus quo reiciendis, accusamus autem sequi itaque ducimus sint laboriosam possimus. Earum.</p>
                            </CardBody>
                        </Card>



                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default SurveyAnalysis;
