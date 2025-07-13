import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LikertScale from '../LikertScale/LikertScale';
import { Card, CardBody, CardFooter, CardHeader, Container, Row, Table } from 'reactstrap';
import Header from 'components/Headers/Header';


const SurveyUserDashboard = () => {
    // const token = localStorage.getItem("token");

    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);

    const [surveyList, setSurveyList] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [userSurveys, setUserSurveys] = useState([]);
    const [next, setNext] = useState(true);

    useEffect(() => {
        setUserId(localStorage.getItem('userId'));          // or pull from parsed user object
        setToken(localStorage.getItem('authUserToken'));          // or pull from parsed user object
    }, []);


    useEffect(() => {
        if (!userId || !token) return;

        const fetchSurveyData = async () => {
            try {
                /* A. — get both payloads */
                const { data: userSurveyList } = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/user/surveys/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const { data: allSurveys } = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/survey`
                );

                /* B. — build the id list once */
                const userIds = userSurveyList.map(u => u.surveyId._id.toString());

                /* C. — filter against the *local* `allSurveys`, not state */
                const matched = allSurveys.filter(s => userIds.includes(s._id.toString()));

                /* D. — finally push everything into state */
                setSurveyList(userSurveyList);   // list with surveyId / subjects
                setSurveys(allSurveys);          // full catalogue (optional)
                setUserSurveys(matched);         // rows to render
            } catch (err) {
                console.error(err);
                toast.error('Could not fetch surveys');
            }
        };

        fetchSurveyData();
    }, [userId, token])

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid >
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                                <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Welcome To Decisions Support</h3>
                            </CardHeader>
                        </Card>
                                <Card className="shadow">
                                    <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                        <h3 className="mb-0">All Surveys {userSurveys.length > 0 ? <>({userSurveys.length})</>:<></>}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        {userSurveys.length > 0 ? <>
                                            <Table className="table-hover header-dash w-100">
                                                <thead>
                                                    <tr className=''>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>#</th>
                                                        <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Survey Name</th>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Preview</th>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className=''>
                                                    {Array.isArray(userSurveys) && userSurveys.map((el, index) => {
                                                        return (
                                                            <>
                                                                <tr key={el._id}>
                                                                    <td className='text-center ps-1 align-middle' style={{ width: '8rem' }}>{index + 1}</td>
                                                                    <td className='text-start ps-1 align-middle'><Link to={`/website/survey-preview/${el._id}`}>{el.surveyName}</Link></td>
                                                                    <td className='text-center ps-1 '>
                                                                        <Link to={`/website/survey-preview/${el._id}`}><i class="fa-solid fa-eye"></i></Link>
                                                                    </td>
                                                                    <td className='text-center ps-1 '>
                                                                        <Link to={`/website/survey-user-instructions/${el._id}`} className="btn btn-info px-4 me-2">Share Instructions</Link>
                                                                        {/* <Link to={`/website/survey-user-share-email/${el._id}`} className="btn btn-info px-4 me-2">Share By Email</Link> */}
                                                                        {/* <Link to={`/website/survey-user-share-email/${el._id}`} className="btn btn-info px-4">Share By SMS</Link> */}
                                                                        <Link to={`/website/survey-result-user/${el._id}`}><i class="fa-solid fa-square-poll-vertical"></i> Result</Link>
                                                                        
                                                                        {/* <Link to={`/admin/survey/analysis/${el._id}`}><i class="fa-solid fa-square-poll-vertical"></i> Analysis</Link> */}
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )
                                                    })
                                                    }
                                                </tbody>
                                            </Table>
                                        </> : <>
                                            <p  className='text-right'>No Surveys Available</p>
                                        </>
                                        }
                                    </CardBody>
                                    <CardFooter>
                                        <CardFooter className='text-center'>
                                            {/* <button type="button" className='btn btn-primary' onClick={()=> setNext(true)} >خلف</button> */}
                                        </CardFooter>
                                    </CardFooter>
                                </Card> 

                    </div>
                </Row>
            </Container>
        </>
    )
}

export default SurveyUserDashboard