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

const SurveyAnalysisArabic = () => {
    const { id, subjectId } = useParams();

    const [surveyResponseObject, setSurveyResponseObject] = useState([]);
    const [surveyObject, setSurveyObject] = useState([]);
    const [subjectObject, setSubjectObject] = useState([]);
    const [categoriesRolesObject, setCategoryRolesObject] = useState([]);
    const [questionObjects, setQuestionObjects] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [traitData, setTraitData] = useState([]);
    const [categoryTraitData, setCategoryTraitData] = useState([]);
    const [traitCategoryData, setTraitCategoryData] = useState([]);
    const [traitSelfOthersData, setTraitSelfOthersData] = useState([]);
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
            return responses.reduce((total, response) => total + (parseInt(response.answer, 10)>0?(parseInt(response.answer, 10)): 0), 0);
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

                    const { categoryName, scoreWeightage } = {categoryName:'Self',scoreWeightage:100};
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
                                    responses: {}
                                };
                            }
                            if (!traitQuestionData[trait][response.questionId].responses[categoryName]) {
                                traitQuestionData[trait][response.questionId].responses[categoryName] = [];
                            }
                            traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10) || 0);
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
                                        responses: {}
                                    };
                                }
                                if (!traitQuestionData[trait][response.questionId].responses[categoryName]) {
                                    traitQuestionData[trait][response.questionId].responses[categoryName] = [];
                                }
                                traitQuestionData[trait][response.questionId].responses[categoryName].push(parseInt(response.answer, 10) || 0);
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

        setTableData(processedTableData);
        setSummaryData(summaryData);
        setTraitData(processedTraitData);
        setCategoryTraitData(processedCategoryTraitData);
        setTraitCategoryData(processedTraitCategoryData);
        setTraitSelfOthersData(processTraitSelfOthersData(processedTraitCategoryData));
        setTraitQuestionData(traitQuestionData);
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
                            <CardBody className='table-responsive'>
                                <table className='table table-bordered mr-3'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th className='text-wrap align-top text-left'><b className='text-white'>Survey Submitted By</b></th>
                                            {Array.isArray(surveyObject[0].questions) && surveyObject[0].questions.map((questionId, index) => (
                                                <th key={questionId} className='text-wrap align-top text-center'>
                                                    <b className="text-white">
                                                        Question{index + 1} - {questionObjects.find(s=> s._id===questionId)?.question}
                                                        {/* {questionId} */}
                                                    </b>
                                                </th>
                                            ))}
                                            <th className='text-wrap align-top text-center'><b className="text-white">Category Name</b></th>
                                            <th className='text-wrap align-top text-center'><b className="text-white">Score Weightage</b></th>
                                            {/* <th className='text-wrap align-top text-center'><b className="text-white">Total Score</b></th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(tableData) && tableData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.surveySubmittedBy}</td>
                                                {Array.isArray(row.questionResponses) && row.questionResponses.map((response, idx) => (
                                                    <td key={idx} className='text-center'>{response !== '0' ? response:''}</td>
                                                ))}
                                                <td className='text-wrap align-top text-center'>{row.categoryName}</td>
                                                <td className='text-center'>{row.scoreWeightage}</td>
                                                {/* <td className='text-center'>{row.totalScore}</td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card>
                        {/* <Card className="shadow mt-2">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Participants</h3>
                            </CardHeader>
                            <CardBody>
                                <table className='table table-bordered'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th className='text-wrap align-top text-start'><b className='text-white'>Category</b></th>
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
                                                <td className='d-flex align-items-center justify-content-center'><progress value={row.completionRate}  max={100} className='w-100' /><span className='px-2'>{row.completionRate}%</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card> */}

                        {/* <Card className="shadow mt-2">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Trait Analysis</h3>
                            </CardHeader>
                            <CardBody>
                                <table className='table table-bordered'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th><b className='text-white'>Trait</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Total Score</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Average Score</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(traitData) && traitData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.trait}</td>
                                                <td className='text-wrap align-top text-center'>{row.totalScore}</td>
                                                <td className='d-flex align-items-center justify-content-center'><progress value={row.averageScore}  max={7} className='w-100' /><span className='px-2'>{row.averageScore}/7</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card> */}

                        {/* <Card className="shadow mt-2">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Category Analysis By Trait</h3>
                            </CardHeader>
                            <CardBody>
                            <table className='table table-bordered'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th><b className='text-white'>Category</b></th>
                                            <th><b className='text-white'>Trait</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Average Score</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(categoryTraitData) && categoryTraitData.map((categoryRow, index) => (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td rowSpan={categoryRow.traits.length + 1}>{categoryRow.category}</td>
                                                </tr>
                                                {Array.isArray(categoryRow.traits) && categoryRow.traits.map((trait, idx) => (
                                                    <tr key={idx}>
                                                        <td>{trait.trait}</td>
                                                        <td className='d-flex align-items-center justify-content-center'><progress value={trait.averageScore}  max={7} className='w-100' /><span className='px-2'>{trait.averageScore}/7</span></td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card> */}


                        {/* <Card className="shadow mt-2">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Trait Analysis By Category</h3>
                            </CardHeader>
                            <CardBody>
                                <table className='table table-bordered'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th><b className='text-white'>Trait</b></th>
                                            <th><b className='text-white'>Category</b></th>
                                            <th className='text-wrap align-top text-center'><b className='text-white'>Average Score</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(traitCategoryData) && traitCategoryData.map((traitRow, index) => (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td rowSpan={traitRow.categories.length + 1}>{traitRow.trait}</td>
                                                </tr>
                                                {Array.isArray(traitRow.categories) && traitRow.categories.map((category, idx) => (
                                                    <tr key={idx}>
                                                        <td>{category.category}</td>
                                                        <td className='d-flex align-items-center justify-content-center'><progress value={category.averageScore} max={7} className='w-100' /><span className='px-2'>{category.averageScore}/7</span></td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card> */}

                        <Card>
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h1 className="mb-0  display-1">Main Report</h1>
                            </CardHeader>
                            <CardBody>
                                <h2 className="my-2 display-2">Participants</h2>
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

                                <hr />
                                <h2 className="mt-4 mb-3 display-2">Competency Summary</h2>
                                <h3>Overall Summary</h3>
                                <p>This section will give you an idea on overall score of an employee</p>
                                <p className='display-3'>{Array.isArray(traitData) && (traitData.reduce((total,res)=> (total+parseInt(res.averageScore, 10)),0) / traitData.length).toFixed(1)}/7</p>
                                {Array.isArray(traitData) && traitData.map((row, index) => (
                                    <p key={index} className='d-flex justify-content-between'>
                                        <span>{row.trait}</span>
                                        <span className='d-flex align-items-center'>
                                            {/* <progress value={row.averageScore} max={7} className='w-100' /> */}
                                            <span className='px-2'>{row.averageScore}</span>
                                            <ProgressBar bgcolor="#6a1b9a" completed={row.averageScore} max={7} />
                                        </span>
                                    </p>
                                ))}

                                <table className='table table-bordered'>
                                    <thead className='thead-white'>
                                        <tr>
                                            <th className='text-wrap align-top text-start w-50'><b className='text-muted'>Areas</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Your Rating</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Others</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(traitSelfOthersData) && traitSelfOthersData.map((item, index) => (
                                            <tr key={index}>
                                                <td className='align-middle'>
                                                    <h3>{item.trait}</h3>
                                                    {/* <p>This section will be used to rate the employee based on their {item.trait}</p> */}
                                                </td>
                                                <td><SimpleDonutChart key={index} data={item.selfRating} trait={item.trait} /></td>
                                                <td><SimpleDonutChart key={index} data={item.averageOtherRating} trait={item.trait} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <hr />
                                {Array.isArray(traitData) && traitData.map((row, index) => (
                                    <React.Fragment key={index}>
                                        <h3>{row.trait}</h3>
                                        <p>This section will be used to rate the employee based on their {row.trait}</p>
                                        <div className='display-3'>
                                            <p className='display-3 font-weight-light d-flex align-items-baseline'>{row.averageScore} <span className='h3 font-weight-light'>/ 7</span></p>
                                            {traitCategoryData.map((traitRow, index) => (
                                                <React.Fragment key={index}>
                                                    {row.trait === traitRow.trait? traitRow.categories.map((category, idx) => (
                                                        <div key={idx} className='d-flex justify-content-end'>
                                                            <p>{category.category} &nbsp;</p>
                                                            <p className='d-flex align-items-center justify-content-center'>
                                                                {/* <progress value={category.averageScore} max={7} className='w-100' /> */}
                                                                <ProgressBar bgcolor="#6a1b9a" completed={category.averageScore} max={7} /><span className='px-2'>{category.averageScore}</span>
                                                            </p>
                                                        </div>
                                                    )):''}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </React.Fragment>
                                ))}

                                <hr />
                                <h2 className="mt-4 mb-3 text-center display-2">Your Strengths</h2>
                                <p className='text-center'>Below are the statements where you received the highest ratings and are considered your key strengths.</p>
                                <div className='d-flex flex-row' style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                                    {Array.isArray(traitData) && traitData.map((traitObj, index) => (
                                        traitObj.averageScore>= (7/2)? <DonutChart key={index} data={traitObj.averageScore} trait={traitObj.trait} />:''
                                    ))}
                                </div>

                                <hr />
                                <h2 className="mt-4 mb-3 text-center display-2">Areas of Improvement</h2>
                                <p className='text-center'>Below are the statements where you received the lowest ratings and are considered your areas of improvements.</p>
                                <div className='d-flex flex-row' style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                                    { traitData.map((traitObj, index) => (
                                        traitObj.averageScore< (7/2)? <DonutChart key={index} data={traitObj.averageScore} trait={traitObj.trait} />:''
                                    ))}
                                </div>

                                <hr />
                                <h2 className="mt-4 mb-3 text-center display-2">Hidden Strengths</h2>
                                <p className='text-center'>Hidden Strengths are statements where you rated yourself lower compared to the average rating of other respondents.</p>
                                <table className='table table-bordered'>
                                    <thead className='thead-white'>
                                        <tr>
                                            <th className='text-wrap align-top text-start w-50'><b className='text-muted'>Areas</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Your Rating</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Others</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {traitSelfOthersData.map((item, index) => (
                                            item.selfRating <= 7/2 && item.averageOtherRating>= 7/2 ?
                                            <tr key={index}>
                                                <td className='align-middle'>
                                                    <h3>{item.trait}</h3>
                                                    <p>This section will be used to rate the employee based on their {item.trait}</p>
                                                </td>
                                                <td><SimpleDonutChart key={index} data={item.selfRating} trait={item.trait} /></td>
                                                <td><SimpleDonutChart key={index} data={item.averageOtherRating} trait={item.trait} /></td>
                                            </tr>
                                            :''
                                        ))}
                                    </tbody>
                                </table>

                                <hr />
                                <h2 className="mt-4 mb-3 text-center display-2">Blind Spots</h2>
                                <p className='text-center'>Blind Spots are statements where you rated yourself higher compared to the average rating of other respondents. These may be your potential areas of improvement.</p>
                                <table className='table table-bordered'>
                                    <thead className='thead-white'>
                                        <tr>
                                            <th className='text-wrap align-top text-start w-50'><b className='text-muted'>Areas</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Your Rating</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Others</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {traitSelfOthersData.map((item, index) => (
                                            (parseFloat(item.selfRating) >= 3.5 && parseFloat(item.averageOtherRating)<= parseFloat(item.selfRating)) ?
                                            <tr key={index}>
                                                <td className='align-middle'>
                                                    <h3>{item.trait}</h3>
                                                    <p>This section will be used to rate the employee based on their {item.trait}</p>
                                                </td>
                                                <td><SimpleDonutChart key={index} data={item.selfRating} /></td>
                                                <td><SimpleDonutChart key={index+1} data={item.averageOtherRating} /></td>
                                            </tr>
                                            :''
                                        ))}
                                    </tbody>
                                </table>


                                <hr />
                                <h2 className="mt-4 mb-3 text-center display-2">Detailed Feedback</h2>
                                <p className='text-center'>The detailed statement-wise rating provides your complete group-wise breakdown of your feedback on each statement.</p>
                                { Object.keys(traitQuestionData).map(trait => (
                                    <div key={trait} className='mt-5'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <h3 className='display-3'>{trait}</h3>
                                            <p className='display-3'>{traitData.find(t => t.trait === trait)?.averageScore}</p>
                                        </div>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th className='w-50'>Questions</th>
                                                    {Array.from(new Set(Object.keys(traitQuestionData[trait]).flatMap(questionId =>
                                                        Object.keys(traitQuestionData[trait][questionId].responses)))).map(category => (
                                                            <th key={category} className='text-center'>{category}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(traitQuestionData[trait]).map(questionId => (
                                                    <tr key={questionId}>
                                                        <td className='w-50 align-middle'><h5>{traitQuestionData[trait][questionId].questionText}</h5></td>
                                                        {Object.keys(traitQuestionData[trait][questionId].responses).map((category,index) => (
                                                            <td><SimpleDonutChart key={index} data={traitQuestionData[trait][questionId].responses[category].reduce((acc, score) => acc + parseFloat(score), 0)/traitQuestionData[trait][questionId].responses[category].length} /> </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}


                                <hr />
                                <h2 className="mt-4 mb-3 text-center display-2">Radar Chart</h2>
                                <RadarGraph radarChartData={radarChartData} categoryTraitData={categoryTraitData} />
                                
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
}

export default SurveyAnalysisArabic;
