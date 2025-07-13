import { useState, useEffect } from "react";
// react component that copies the given text inside your clipboard
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from 'axios';

import 'reactjs-popup/dist/index.css';

import 'react-toastify/dist/ReactToastify.css';
import { Link, useParams } from 'react-router-dom';

// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import LikertScale from "components/LikertScale/LikertScale";



const SurveyShareInstructions = () => {
    const { id } = useParams();
    let count = 0;
    const [copiedText, setCopiedText] = useState();
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    const [btnActive, setBtnActive] = useState(true)

    const [surveyDe, setSurveyDe] = useState([]);
    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);
    const [selectNA, setSelectNA] = useState([])

    useEffect(() => {
        const fetchSurveyData = async () => {

            const TraitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            setTrait(TraitResponse.data)

            const questionResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
            setQuestions(questionResponse.data)

            const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`)
            setSurveyDe(surveyResponse.data)
        };

        fetchSurveyData();
    }, [id])


    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid  >
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            {Array.isArray(surveyDe) && surveyDe?.map((survey) => {
                                return (
                                    <>
                                        <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                            <h3 className="mb-0">{survey.surveyName}</h3>
                                            <div className='d-flex flex-row '>
                                                <div className='mx-3'>
                                                    {/* <button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>Subject</button>
                                                    <button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>Respondents</button> */}
                                                    {/* <button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>الفرد المُقيَّم</button>
                                                    <button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>االمقيمون الآخرون</button> */}
                                                </div>

                                                <Link to={`/admin/survey-share-email/${survey._id}`} className="btn btn-info px-4 me-2">Share By Email</Link>
                                                <Link to={`/admin/survey-share-by-sms/${survey._id}`} className="btn btn-info px-4">Share By SMS</Link>
                                                
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                <p className='d-flex' >أولًا: مشاركة المقياس معكم ومع الآخرين</p>
                                <p className='d-flex' >يمكنكم مشاركة المقياس بطريقتين:</p>
                                <ul>
                                    <li>
                                        <p className='d-flex' >عبر الرسائل النصية (SMS):</p>
                                        <p className='d-flex' >من خلال الضغط على زر &quot;مشاركة عبر الرسائل النصية&quot;، ثم إدخال بياناتكم وبيانات
                                            المقيمين الآخرين، مع ملاحظة أن رقم الجوال يُدخل بالصيغة التالية:
                                            (5XXXXXXXX).</p>
                                    </li>
                                    <li>
                                        <p className='d-flex' >عبر البريد الإلكتروني:</p>
                                        <p className='d-flex' >من خلال الضغط على زر "مشاركة عبر البريد الإلكتروني"، ثم إدخال بياناتكم وبيانات المقيمين الآخرين.</p>
                                    </li>
                                </ul>
                                <h3 className='d-flex' >ثانيًا: طريقة الاستجابة على المقياس</h3>
                                <p className='d-flex' >عند الضغط على الرابط المرسل عبر الرسالة النصية أو البريد الإلكتروني، سيتم توجيهكم إلى صفحة المقياس حيث يمكنكم:</p>
                                <ul>
                                    <li className='d-flex' >قراءة كل فقرة بعناية.</li>
                                    <li className='d-flex' >اختيار الدرجة التي تعبّر عن مدى موافقتكم أو معارضتكم لمحتوى الفقرة.</li>
                                    <li className='d-flex' >في حال تعذّر عليكم تقييم فقرة معينة، يمكنكم اختيار خيار "غير قادر على التقييم".</li>
                                </ul>
                                <h3 className='d-flex' >ثالثًا: إرسال المقياس</h3>
                                <ul>
                                    <li className='d-flex' >بعد التأكد من الإجابة على جميع الفقرات، يُرجى الضغط على زر "إرسال" الموجود في نهاية المقياس.</li>
                                    <li className='d-flex' >إذا لم تتم عملية الإرسال بنجاح، يُرجى التأكد من عدم ترك أي فقرة دون إجابة.</li>
                                </ul>
                                <h3 className='d-flex' >رابعًا: عرض النتائج</h3>
                                <p className='d-flex' >بعد إتمام جميع المقيمين للمقياس بنجاح، يمكنكم الاطلاع على النتائج والتقرير من خلال الضغط على زر "نتيجة المقياس" في حسابكم الشخصي.</p>
                                <h3 className='text-center my-3 d-flex' >نتمنى لك تجربة تقييم موفقة وثرية.</h3>
                            </CardBody>
                                    </>
                                )
                            })}
                        </Card>
                        <Card className="d-flex flex-row justify-content-center py-3">
                                <Link to={`/admin/survey-details/${id}`} target="_blank" className="btn btn-success px-4 me-2">Survey Preview</Link>
                                {/* <Link to={`/survey-respondent/${id}`} target="_blank" className="btn btn-success px-4 me-2">Preview for Respondent</Link> */}
                                <Link to={`/admin/survey-share-email/${id}`} className="btn btn-info px-4 me-2">Share By Email</Link>
                                <Link to={`/admin/share-by-sms/${id}`} className="btn btn-info px-4">Share By SMS</Link>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default SurveyShareInstructions;
