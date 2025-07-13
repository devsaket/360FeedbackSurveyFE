import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LikertScale from '../LikertScale/LikertScale';
import { Card, CardBody, CardFooter, CardHeader, Container, Row, Table } from 'reactstrap';
import Header from 'components/Headers/Header';


const SurveyUserInstructions = () => {
    const { id } = useParams();

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid >
                <Row className="mt--3">
                    <div className="col">
                                <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Welcome To Admin Dashboard</h3>
                            </CardHeader>
                        </Card>

                        <Card className="shadow my-3">
                            <CardHeader className="bg-transparent d-flex flex-column justify-content-end align-items-start">
                                {/* <h3 className="mb-0">GuideLines</h3> */}
                                <h3 className="mb-0">شكرًا لطلبكم هذا المقياس. قبل البدء، نود توضيح الخطوات والتعليمات الخاصة بكيفية</h3>
                                <h3 className="mb-0">مشاركة المقياس والاستجابة عليه:</h3>
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
                            <CardFooter className='text-center'>
                                {/* <button type="button" className='btn btn-primary' onClick={()=>{}} >التالي</button> */}
                                <Link to={`/website/survey-user-share-email/${id}`} className="btn btn-info px-4 me-2">Share By Email</Link>
                                <Link to={`/website/survey-user-share-sms/${id}`} className="btn btn-info px-4">Share By SMS</Link>
                            </CardFooter>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    )
}

export default SurveyUserInstructions