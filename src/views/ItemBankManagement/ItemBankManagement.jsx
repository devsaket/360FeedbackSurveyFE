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
    Col, Button, Collapse
} from 'reactstrap';
// core components
import Header from "components/Headers/Header.js";

const ItemBankManagement = () => {
    const [copiedText, setCopiedText] = useState();

    const [Trait, setTrait] = useState([])
    const [Questions, setQuestions] = useState([])
    const [btnActive, setBtnActive] = useState(true)

    const [openId, setOpenId] = useState(null);
    const toggle = (id) => {
        setOpenId(openId === id ? null : id);
    };

    useEffect(() => {
        // fetch Traits & Questions from backend
        const fetchData = async () => {
            try {
                const traitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
                setTrait(traitResponse.data);

                const questionsResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
                setQuestions(questionsResponse.data);

            } catch (error) {
                console.error('Error ', error)
            }
        };

        fetchData();
    }, []);

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
                                <h3 className="mb-0">All Items</h3>
                                <div>
                                    <Button className='btn' color="primary" onClick={() => setBtnActive(true)} disabled={btnActive}>Subject</Button>
                                    <Button className='btn' color="primary" onClick={() => setBtnActive(false)} disabled={!btnActive}>Respondents</Button>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {Array.isArray(Trait) && Trait.map((trait) => (
                                    <div key={trait._id}>
                                        <Button color="link" className="border w-100 text-left d-flex justify-content-between my-2" onClick={() => toggle(trait._id)}>
                                            {trait.traitName} <i className="fa-solid fa-chevron-down"></i>
                                        </Button>
                                        <Collapse isOpen={openId === trait._id}>
                                            <Card>
                                                <CardBody>
                                                    <p className='ps-4 card-text'>{trait.traitDescription}</p>
                                                    <p className='my-2 ps-4 fw-bold'> Questions Available in {trait.traitName} Trait</p>
                                                    <ul className='ms-4'>
                                                        {Array.isArray(Questions) && Questions.filter(question => question.trait._id === trait._id)
                                                            .map(question => (
                                                                <li key={question._id}>{btnActive ? question.question : question.questionOthers}</li>
                                                            ))}
                                                    </ul>
                                                </CardBody>
                                            </Card>
                                        </Collapse>
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

export default ItemBankManagement;
