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
import { useState, useEffect, useRef } from "react";
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
import { Link, useParams } from 'react-router-dom';
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


export const useDetectOutsideClick = (el, initialState) => {
    const [isActive, setIsActive] = useState(initialState);

    useEffect(() => {
        const onClick = e => {
            // If the active element exists and is clicked outside of
            if (el.current !== null && !el.current.contains(e.target)) {
                setIsActive(!isActive);
            }
        };

        // If the item is active (ie open) then listen for clicks outside
        if (isActive) {
            window.addEventListener("click", onClick);
        }

        return () => {
            window.removeEventListener("click", onClick);
        };
    }, [isActive, el]);

    return [isActive, setIsActive];
};


const QuestionBankSchema = Joi.object({
    question: Joi.string().required(),
    questionOthers: Joi.string().required(),
    trait: Joi.string().required(),
    questionCode: Joi.string().required(),
});

const QuestionManagement = () => {
    const { traitId } = useParams();

    const [copiedText, setCopiedText] = useState();

    const [modal, setModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);

    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);

    const dropdownRef = useRef(null);
    const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false);
    const onClick = () => setIsActive(!isActive);

    const [btnActive, setBtnActive] = useState(true)
    const [updateMode, setUpdateMode] = useState(false);
    const [updateQuestion, setSelectedQuestion] = useState({});

    const toggle = () => setModal(!modal);
    const uploadToggle = () => setUploadModal(!uploadModal);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: joiResolver(QuestionBankSchema),
        defaultValues: {
            question: "",
            questionOthers: "",
            trait: "",
            questionCode: ""
        }
    });

    useEffect(() => {
        axios.get('http://localhost:5454/api/v1/trait/')
            .then(res => {
                setTrait(res.data);
            })
            .catch(err => console.log(err));

        if (traitId) {
            axios.get('http://localhost:5454/api/v1/question/')
                .then(res => {
                    (res.data).filter(el => el.trait._id === traitId)
                    setQuestions(res.data)
                })
                .catch(err => console.log(err));
        } else {
            axios.get('http://localhost:5454/api/v1/question/')
                .then(res => {
                    setQuestions(res.data)
                })
                .catch(err => console.log(err));
        }
    }, [traitId]);

    const onSubmit = (data) => {
        if(updateMode){
            const postData = {...data, _id:updateQuestion._id}
            axios.put(`http://localhost:5454/api/v1/question/${updateQuestion._id}`, postData)
                .then((res) => {
                    if (res.data.status) {
                        reset({ question: "", questionOthers: "", trait: "", questionCode: "" });
                        toast.success(res.data.message);
                        toggle();
                        getQuestions();
                        setUpdateMode(false);
                        setSelectedQuestion({})
                    } else {
                        toast.warn(res.data.message);
                    }
                })
        }else{
            axios.post('http://localhost:5454/api/v1/question', data)
            .then((res) => {
                if (res.status === 200) {
                    reset({ question: "", questionOthers: "", trait: "", questionCode: "" });
                    toast.success("Question Inserted Successfully!");
                    toggle();
                    getQuestions();
                } else {
                    toast.warn("Something Went Wrong!");
                    getQuestions();
                }
            })
            .catch((err) => {
                console.log(err?.message)
                toast.warn("Duplicate Question Code");
            });
        }
    }

    const selectedQuestion = (data) => {
        setUpdateMode(true);
        reset({ question: data.question, questionOthers: data.questionOthers, trait: data.trait._id, questionCode: data.questionCode });
        setSelectedQuestion(data);

    };

    const getQuestions = () => {
        axios.get('http://localhost:5454/api/v1/question/')
            .then(res => {
                setQuestions(res.data);
            })
            .catch(err => console.log(err));
    };

    const deleteQuestion = (id) => {
        axios.delete(`http://localhost:5454/api/v1/question/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.status) {
                // toast.success("Trait Successfully Deleted!");
                toast.success(res.data.message);
                getQuestions()
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
                                <h3 className="mb-0">All Questions</h3>
                                <div>
                                    <button className='btn btn-primary' onClick={()=> setBtnActive(true) } disabled={btnActive}>Subject</button>
                                    <button className='btn btn-primary' onClick={()=> setBtnActive(false) } disabled={!btnActive}>Respondents</button>
                                
                                    {/*<Button onClick={uploadToggle}><i className="fa-solid fa-upload"></i> Upload Questions</Button>*/}
                                    <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add Question</Button>
                                </div>
                                <Modal>
                                    <ModalHeader>
                                        <h3 className="mb-0"> Upload Questions</h3>
                                    </ModalHeader>
                                    
                                </Modal>
                                <Modal isOpen={modal} toggle={toggle}   >
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <ModalHeader toggle={toggle}>
                                            <h3 className="mb-0">{updateMode ? 'Update' : 'Add'} Question</h3>
                                        </ModalHeader>
                                        <ModalBody>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Enter Question for Subject</label>
                                                <input {...register("question")} className="form-control" type="text" placeholder='Enter Question for Subject' />
                                                {errors.question && <p className='form-error'>Question for Subject is Required!</p>}
                                            </div>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Enter Question for Respondents</label>
                                                <input {...register("questionOthers")} className="form-control" type="text" placeholder='Enter Question for Respondents' />
                                                {errors.questionOthers && <p className='form-error'>Question for Respondents is Required!</p>}
                                            </div>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Select A Trait</label>
                                                <select  {...register("trait")} className="form-control" placeholder="Select a Trait">
                                                    <option selected={true}>Select a Trait</option>
                                                    {
                                                        Trait.length >= 1 ? Trait.map((el, index) => {
                                                            return (<>
                                                                <option value={el._id} className='text-dark'>{el.traitName}</option>
                                                            </>)
                                                        }) : <>No Trait Available</>
                                                    }

                                                </select>
                                                {errors.trait && <p className='form-error'>Trait is Required!</p>}
                                            </div>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Enter Question Code</label>
                                                <input {...register("questionCode")} className="form-control" type="text" placeholder='Enter Question Code' />
                                                {errors.questionCode && <p className='form-error'>Question Code is Required!</p>}
                                            </div>


                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="primary" className='px-5 my-2' type="submit"> Submit </Button>

                                            <Button color="secondary" onClick={toggle}>
                                                Cancel
                                            </Button>
                                        </ModalFooter>
                                    </form>
                                </Modal>
                            </CardHeader>
                            <CardBody>
                                <table className="table table-hover header-dash">
                                    <thead className='position-relative'>
                                        <tr className=''>
                                            <th scope="col" className='text-center align-text-top ps-1 bg-dark text-white' style={{ width: '6rem' }}>S.No</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Code</th>
                                            <th scope="col-6" className='text-start align-text-top ps-2 bg-dark text-white'>Question</th>
                                            <th scope="col-2" className='text-start align-text-top ps-2 bg-dark text-white'>Trait</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th>
                                            {/* <th scope="col" className='text-center align-text-top ps-2'>Updated At</th> */}
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                        </tr>
                                    </thead>

                                    <tbody className=''>
                                        {/* {pageData.map((el, index) => { */}
                                        {Questions.map((el, index) => {
                                            return (
                                                <tr key={el._id}>
                                                    <td className='text-center ps-1 align-middle' style={{ width: '8rem' }}>{index + 1}</td>
                                                    <td className='text-start ps-1 align-middle'>{el.questionCode}</td>
                                                    <td className='text-start ps-1 align-middle'>
                                                        <span style={btnActive ? { display: 'block' } : { display: 'none' }}>{el.question}</span>
                                                        <span style={btnActive ? { display: 'none' } : { display: 'block' }}>{el.questionOthers}</span>
                                                    </td>
                                                    <td className='text-start ps-1 align-middle'>{el.trait.traitName}</td>
                                                    <td className='text-center ps-1 align-middle'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                    <td className='text-center ps-1 '>
                                                        <button className='btn p-2 text-success fs-4' type='button' onClick={() => { selectedQuestion(el); toggle(); }} > <i className="fa-solid fa-pencil"></i></button>

                                                        <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash text-danger"></i></button>} position="top right">
                                                            <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.question}</span>?</div>
                                                            <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => deleteQuestion(el._id)}>Delete</button>
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

export default QuestionManagement;
