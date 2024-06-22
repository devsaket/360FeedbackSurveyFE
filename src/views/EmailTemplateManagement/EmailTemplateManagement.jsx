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
// react component that copies the given text inside your clipboard
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from 'axios';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { toast, ToastContainer } from 'react-toastify';
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "@hapi/joi";
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    UncontrolledTooltip, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";

const EmailTemplateSchema = Joi.object({
    templateName: Joi.string().required(),
    templateSubject: Joi.string().required(),
    templateMessage: Joi.string().required(),
    templateForSubject: Joi.boolean().required(),
});


const EmailTemplateManagement = () => {
    const [copiedText, setCopiedText] = useState();
    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);
    const [EmailTemplatesData, setEmailTemplatesData] = useState([]);
    
    const [updateMode, setUpdateMode] = useState(false);
    const [updateEmailTemplate, setSelectedEmailTemplate] = useState({});

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: joiResolver(EmailTemplateSchema),
        defaultValues: { templateName: "", templateSubject: "", templateMessage: "", templateForSubject: false }
    });

    // Fetch trait Data
    useEffect(() => {
        getEmailTemplates()
    }, []);

    const getEmailTemplates = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL+'/emailTemplate/')
            .then(res => {
                setEmailTemplatesData(res.data);
            })
            .catch(err => console.log(err));
    };

    const selectedEmailTemplate = (data) => {
        setUpdateMode(true);
        reset({ templateName: data.templateName, templateSubject: data.templateSubject, templateMessage:data.templateMessage, templateForSubject:data.templateForSubject });
        setSelectedEmailTemplate(data);
    };

    const onSubmit = (data) => {
        if(updateMode){
            const postData = {...data, _id:updateEmailTemplate._id}
            axios.put(process.env.REACT_APP_BACKEND_URL+`/emailtemplate/${updateEmailTemplate._id}`, postData)
                .then((res) => {
                    if (res.data.status) {
                        reset({ templateName: "", templateSubject: "", templateMessage: "", templateForSubject: false, });
                        toast.success(res.data.message);
                        toggle();
                        getEmailTemplates();
                        setUpdateMode(false);
                        setSelectedEmailTemplate({})
                    } else {
                        toast.warn(res.data.message);
                    }
                })
        }else{
            axios.post(process.env.REACT_APP_BACKEND_URL+'/emailtemplate', data)
            .then((res) => {
                if (res.data.status) {
                    reset({ templateName: "", templateSubject: "", templateMessage: "", templateForSubject: false, });
                    toast.success("Email Template Inserted Successfully!");
                    toggle();
                    getEmailTemplates();
                } else {
                    toast.warn("Something Went Wrong!");
                }
            })
            .catch((err) => console.log(err?.message));
        }
    };


    const deleteEmailTemplate = (id) => {
        axios.delete(process.env.REACT_APP_BACKEND_URL+`/emailTemplate/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.status) {
                // toast.success("Email Template Successfully Deleted!");
                toast.success(res.data.message);
                getEmailTemplates()
            } else {
                toast.warn(res.data.message);
            }
        }
        ).catch(err => console.log(err))
    };


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
                                <h3 className="mb-0">All Email Templates</h3>
                                <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add Email Templates</Button>
                                <Modal isOpen={modal} toggle={toggle}   >
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <ModalHeader toggle={toggle}>
                                            <h3 className="mb-0">{updateMode ? 'Update' : 'Add'} Email Templates</h3>
                                        </ModalHeader>
                                        <ModalBody>
                                            <label className="form-label">Email Template Name</label>
                                            <input {...register("templateName")} className="form-control" type="text" placeholder="Enter Email Template Name" />
                                            {errors.templateName && <p className='form-error'>Email Template Name is Required!</p>}

                                            <label className="form-label">Email Template Subject</label>
                                            <input {...register("templateSubject")} className="form-control" type="text" placeholder="Enter Email Template Subject" />
                                            {errors.templateSubject && <p className='form-error'>Email Template Subject is Required!</p>}

                                            <label className="form-label">Email Template Message</label>
                                            <TextareaAutosize  {...register("templateMessage")} className="form-control" placeholder="Enter Email Template Message" minRows={5} maxRows={10}></TextareaAutosize>
                                            {errors.templateMessage && <p className='form-error'>Email Template Message is Required!</p>}

                                            {/* <div className='form-check ms-0 ps-0 d-flex align-items-center'> */}
                                                <label className="form-label pt-2 ms-0">For Whom </label>
                                                <label htmlFor="field-subject" className='form-check-label mx-5'>
                                                    <input {...register("templateForSubject")} type="radio" value="true" id="field-subject" className="form-check-input" />Subject
                                                </label>
                                                <label htmlFor="field-respondents" className='form-check-label'>
                                                    <input {...register("templateForSubject")} type="radio" value="false" id="field-respondents" className="form-check-input" defaultChecked={true} />Respondents
                                                </label>
                                            {/* </div> */}

                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="primary" className='px-5 my-2' type="submit"> Submit </Button>
                                            <Button color="secondary" onClick={toggle}> Cancel </Button>
                                        </ModalFooter>
                                    </form>
                                </Modal>
                            </CardHeader>
                            <CardBody>
                                <table className="table table-hover header-dash">
                                    <thead className='position-relative'>
                                    <tr className=''>
                                                    <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>S.No</th>
                                                    <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Template Name</th>
                                                    <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Template Subject</th>
                                                    <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th>
                                                    <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                                </tr>
                                    </thead>

                                    <tbody className=''>
                                    {Array.isArray(EmailTemplatesData) && EmailTemplatesData.map((el, index) => {
                                                    return (
                                                        <tr key={el._id}>
                                                            <td className='text-center ps-1 align-start' style={{ width: '8rem' }}>{index + 1}</td>
                                                            <td className='text-start ps-1 align-start'>{el.templateName}</td>
                                                            <td className='text-start ps-1 align-start'>{el.templateSubject}</td>
                                                            <td className='text-center ps-1 align-start'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                            <td className='text-center ps-1 '>
                                                                <button className='btn p-2 text-success fs-4' type='button' onClick={() => { selectedEmailTemplate(el); toggle(); }} > <i className="fa-solid fa-pencil"></i></button>

                                                                <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash text-danger"></i></button>} position="top right">
                                                                    <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.templateName}</span>?</div>
                                                                    <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => deleteEmailTemplate(el._id)}>Delete</button>
                                                                </Popup>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                                }
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default EmailTemplateManagement;
