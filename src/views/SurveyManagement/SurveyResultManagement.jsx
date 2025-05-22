/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row, Button
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import { exportToExcel } from './excelUtils';

const SurveyResultManagement = () => {

    const { surveyId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [traits, setTraits] = useState([]);
    const [Categories, setCategories] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [surveyResult, setSurveyResult] = useState([]);

    useEffect(() => {
        // Fetch traits from the backend
        getTraits();
        // Fetch questions from the backend
        getQuestions();

        // Fetch Categories from the Backend
        getCategories();

        //fetch surveys from the Backend
        getSurveys();
        // Fetch surveys from the backend
        axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response/${surveyId}`)
            .then(response => {
                setSurveyResult(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching surveys:', error);
            });
    }, [surveyId]);

    const getSurveys = () => {
        // Fetch surveys from the backend
        axios.get(process.env.REACT_APP_BACKEND_URL + '/survey')
            .then(response => {
                setSurveys(response.data);
            })
            .catch(error => {
                console.error('Error fetching surveys:', error);
            });
    }

    const getQuestions = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/question')
            .then(response => {
                setQuestions(response.data);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
            });
    }

    const getTraits = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/trait')
            .then(res => {
                setTraits(res.data);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
            });
    }

    const getCategories = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/categoryRoles')
            .then(res => {
                setCategories(res.data);
            })
            .catch(error => {
                console.error('Error fetching Categories:', error);
            });
    }

    // const handleDownload = () => {
    //     exportToExcel(surveyResult, 'Survey_Responses');
    // };

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7 justify-content-end" fluid>
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                {/* <h3 className="mb-0">Survey Result</h3> */}
                                <h3 className="mb-0" dir="rtl">نتيجة الاستطلاع</h3>
                                {/* <Button onClick={handleDownload}>Download Excel</Button> */}
                            </CardHeader>
                            <CardBody>

                                {Array.isArray(surveyResult) && surveyResult.map((survey, index) => (
                                    <div key={survey._id}>
                                        {/* <h2>Survey Name: {survey.surveyId} {Array.isArray(surveys) && surveys.find(s=> s._id===survey.surveyId)?.surveyName}</h2> */}
                                        <h2 dir="rtl">
                                            <span>اسم المقياس {Array.isArray(surveys) && surveys.find(s=> s._id===survey.surveyId)?.surveyName}</span> 
                                        </h2>
                                        {/* <p>{survey.surveyId} {Array.isArray(surveys) && surveys.find(s=> s._id===survey.surveyId)?.surveyDescription}</p> */}
                                        <p dir="rtl">
                                            {/* {survey.surveyId}  */}
                                            {Array.isArray(surveys) && surveys.find(s=> s._id===survey.surveyId)?.surveyDescription}
                                        </p>
                                        {Array.isArray(survey.subject) && survey.subject.map((subject,m) => (
                                            <Card key={subject._id} style={{ marginBottom: '20px' }}>
                                                {/* <h3>
                                                    Subject {m+1}: {subject.subjectName} ({subject.subjectEmail})  {subject.isFilled? 'Filled': 'Not Filled'}  
                                                    <Link to={`/admin/survey-result-by-subject/${surveyId}/${subject._id}`}>See Results</Link>
                                                </h3> */}
                                                <h3 dir="rtl">
                                                    الفرد المُقيَّم {m+1}: {subject.subjectName} ({subject.subjectEmail}) - {subject.isFilled? 'تم التقييم': 'لم يتم التقييم'}
                                                    <Link to={`/admin/survey-result-by-subject/${surveyId}/${subject._id}`}>مشاهدة النتائج</Link>
                                                    {/* <Button>See Results</Button> */}
                                                </h3>
                                                {/* <h4>Responses:</h4>
                                                <ul>
                                                    {subject.responses.map(response => (
                                                        <li key={response._id}>
                                                            Question ID: {response.questionId} - {questions.find(s=> s._id===response.questionId)?.question}, Answer: {response.answer}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <h4>Respondents:</h4>
                                                {subject.respondent.map(respondent => (
                                                    <div key={respondent._id} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                                                        <h5>Respondent: {respondent.respondentName} ({respondent.respondentEmail})</h5>
                                                        <p>Category ID: {respondent.category} - {Categories.find(s=> s._id===respondent.category)?.categoryName}</p>
                                                        <ul>
                                                            {respondent.responses.map(response => (
                                                                <li key={response._id}>
                                                                    Question ID: {response.questionId} - {questions.find(s=> s._id===response.questionId)?.question}, Answer: {response.answer}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))} */}
                                            </Card>
                                        ))}
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>
                </Row>

            </Container>
        </>
    );
};

export default SurveyResultManagement;
