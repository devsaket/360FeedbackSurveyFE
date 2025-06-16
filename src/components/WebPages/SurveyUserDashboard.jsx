import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LikertScale from '../LikertScale/LikertScale';
import { Card, CardBody, CardFooter, CardHeader, Container, Row, Table } from 'reactstrap';


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
            {/* <Header /> */}
            {/* Page content */}
            <Container className="mt--7" fluid dir='rtl'>
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                        {
                            next ? <>
                                <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                {/* <h3 className="mb-0">Welcome To Decisions Support</h3> */}
                                <h3 className="mb-0 d-flex">مرحبًا بك في صفحة التقييم</h3>
                            </CardHeader>
                        </Card>

                        <Card className="shadow my-3">
                            <CardHeader className="bg-transparent d-flex flex-column justify-content-end align-items-start">
                                {/* <h3 className="mb-0">GuideLines</h3> */}
                                <h3 className="mb-0">شكرًا لطلبكم هذا المقياس. قبل البدء، نود توضيح الخطوات والتعليمات الخاصة بكيفية</h3>
                                <h3 className="mb-0">مشاركة المقياس والاستجابة عليه:</h3>
                            </CardHeader>
                            <CardBody>
                                <p className='d-flex' dir='rtl'>أولًا: مشاركة المقياس معكم ومع الآخرين</p>
                                <p className='d-flex' dir='rtl'>يمكنكم مشاركة المقياس بطريقتين:</p>
                                <ul>
                                    <li>
                                        <p className='d-flex' dir='rtl'>عبر الرسائل النصية (SMS):</p>
                                        <p className='d-flex' dir='rtl'>من خلال الضغط على زر &quot;مشاركة عبر الرسائل النصية&quot;، ثم إدخال بياناتكم وبيانات
                                            المقيمين الآخرين، مع ملاحظة أن رقم الجوال يُدخل بالصيغة التالية:
                                            (5XXXXXXXX).</p>
                                    </li>
                                    <li>
                                        <p className='d-flex' dir='rtl'>عبر البريد الإلكتروني:</p>
                                        <p className='d-flex' dir='rtl'>من خلال الضغط على زر "مشاركة عبر البريد الإلكتروني"، ثم إدخال بياناتكم وبيانات المقيمين الآخرين.</p>
                                    </li>
                                </ul>
                                <h3 className='d-flex' dir='rtl'>ثانيًا: طريقة الاستجابة على المقياس</h3>
                                <p className='d-flex' dir='rtl'>عند الضغط على الرابط المرسل عبر الرسالة النصية أو البريد الإلكتروني، سيتم توجيهكم إلى صفحة المقياس حيث يمكنكم:</p>
                                <ul>
                                    <li className='d-flex' dir='rtl'>قراءة كل فقرة بعناية.</li>
                                    <li className='d-flex' dir='rtl'>اختيار الدرجة التي تعبّر عن مدى موافقتكم أو معارضتكم لمحتوى الفقرة.</li>
                                    <li className='d-flex' dir='rtl'>في حال تعذّر عليكم تقييم فقرة معينة، يمكنكم اختيار خيار "غير قادر على التقييم".</li>
                                </ul>
                                <h3 className='d-flex' dir='rtl'>ثالثًا: إرسال المقياس</h3>
                                <ul>
                                    <li className='d-flex' dir='rtl'>بعد التأكد من الإجابة على جميع الفقرات، يُرجى الضغط على زر "إرسال" الموجود في نهاية المقياس.</li>
                                    <li className='d-flex' dir='rtl'>إذا لم تتم عملية الإرسال بنجاح، يُرجى التأكد من عدم ترك أي فقرة دون إجابة.</li>
                                </ul>
                                <h3 className='d-flex' dir='rtl'>رابعًا: عرض النتائج</h3>
                                <p className='d-flex' dir='rtl'>بعد إتمام جميع المقيمين للمقياس بنجاح، يمكنكم الاطلاع على النتائج والتقرير من خلال الضغط على زر "نتيجة المقياس" في حسابكم الشخصي.</p>
                                <h3 className='text-center my-3 d-flex' dir='rtl'>نتمنى لك تجربة تقييم موفقة وثرية.</h3>
                            </CardBody>
                            <CardFooter className='text-center'>
                                <button type="button" className='btn btn-primary' onClick={()=> setNext(false)} dir='rtl'>التالي</button>
                            </CardFooter>
                        </Card>
                            </> :<>
                                <Card className="shadow">
                                    <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                        {/* <h3 className="mb-0">All Surveys ({userSurveys.length})</h3> */}
                                        <h3 className="mb-0">جميع الاستبيانات {userSurveys.length > 0 ? <>({userSurveys.length})</>:<></>}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        {userSurveys.length > 0 ? <>
                                            <Table className="table-hover header-dash w-100">
                                                <thead>
                                                    <tr className=''>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>#</th>
                                                        {/* <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Survey Name</th>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Preview</th>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Actions</th> */}
                                                        <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>اسم الاستطلاع</th>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>معاينة</th>
                                                        <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>الإجراءات</th>
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
                                                                        {/* <Link to={`/website/survey-user-share-email/${el._id}`} className="btn btn-info px-4 me-2">Share By Email</Link> */}
                                                                        <Link to={`/website/survey-user-share-email/${el._id}`} className="btn btn-info px-4 me-2">مشاركة عبر البريد الإلكتروني</Link>
                                                                        {/* <Link to={`/website/survey-user-share-email/${el._id}`} className="btn btn-info px-4">Share By SMS</Link> */}
                                                                        <Link to={`/website/survey-user-share-sms/${el._id}`} className="btn btn-info px-4">مشاركة عبر الرسائل النصية</Link>
                                                                        {/* <Link to={`/website/survey-result-user/${el._id}`}><i class="fa-solid fa-square-poll-vertical"></i> Result</Link> */}
                                                                        <Link to={`/website/survey-result-user/${el._id}`} className='btn btn-outline-dark'><i class="fa-solid fa-square-poll-vertical mx-2"></i>نتيجة</Link>
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
                                                    <p dir='rtl' className='text-right'>لم يتم شراء أي استطلاعات!</p>
                                        </>
                                        }
                                    </CardBody>
                                    <CardFooter>
                                        <CardFooter className='text-center'>
                                            <button type="button" className='btn btn-primary' onClick={()=> setNext(true)} dir='rtl'>خلف</button>
                                        </CardFooter>
                                    </CardFooter>
                                </Card> 
                            : <></>

                        
                        </>
                        }
                    </div>
                </Row>
            </Container>
        </>
    )
}

export default SurveyUserDashboard