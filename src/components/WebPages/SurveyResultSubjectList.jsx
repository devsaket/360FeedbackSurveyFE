import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {Card, CardHeader, CardBody, Container, Row, Button, Table } from "reactstrap";
import Header from "components/Headers/Header.js";

const SurveyResultSubjectList = () => {
    const { surveyId } = useParams();
    const navigate = useNavigate();

    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);

    const [questions, setQuestions] = useState([]);
    const [traits, setTraits] = useState([]);
    const [Categories, setCategories] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [surveyResult, setSurveyResult] = useState([]);
    const [userSubjectIds, setUserSubjectIds] = useState([]);

    useEffect(() => {
        setUserId(localStorage.getItem('userId'));          // or pull from parsed user object
        setToken(localStorage.getItem('authUserToken'));          // or pull from parsed user object
    }, []);


    useEffect(() => {
        if (!userId || !token) return;

        getUserSurveySubjects();
        getTraits();
        getQuestions();
        getCategories();
        getSurveys();
        getSurveyResult()
    }, [surveyId, userId, token]);

    const getUserSurveySubjects = ()=>{
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/user/survey/subjects/${surveyId}`, 
            {
                headers: { Authorization: `Bearer ${token}` },
                params: {userId: userId}
            },
        )
        .then(res => {
            console.log("User Subjects = ",res.data)
            setUserSubjectIds(res.data.subjects ?? [])
        })
        .catch(err => console.error("user subjects:", err));
    }

    const getSurveyResult = () => {
        // Fetch survey Response from the backend
        axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response/${surveyId}`)
            .then(response => {
                setSurveyResult(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching surveys:', error);
            });
    }

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

    const filteredResult = useMemo(() => {
        if (!Array.isArray(surveyResult) || userSubjectIds.length === 0)
            return [];

        return surveyResult.map(sr => ({
            ...sr,
            subject: sr.subject?.filter(sub =>
                userSubjectIds.some(id => id === sub._id)
            ),
        }));
    }, [surveyResult, userSubjectIds]);

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Survey Result - Subjects List</h3>
                            </CardHeader>
                            <CardBody>
                                <Table className="table-hover header-dash w-100">
                                    <thead>
                                        <tr className=''>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>S.No</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Subject Name</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Email</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Status</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className=''>
                                        {Array.isArray(filteredResult) && filteredResult.map((survey, index) => (
                                            Array.isArray(survey.subject) && survey.subject.map((subject, m) => (
                                                <tr key={subject._id} style={{ marginBottom: '20px' }}>
                                                    <td className='text-center ps-1 align-middle' style={{ width: '8rem' }}>{m + 1}</td>
                                                    <td>{subject.subjectName}</td>
                                                    <td>{subject.subjectEmail}</td>
                                                    <td>{subject.isFilled ? 'Filled' : 'Not Filled'}</td>
                                                    <td>
                                                        <Link to={`/website/survey-result-user/${surveyId}/${subject._id}`}>See Results</Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ))}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>
                </Row>

            </Container>
        </>
    );
};

export default SurveyResultSubjectList;
