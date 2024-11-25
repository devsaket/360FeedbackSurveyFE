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
import { toast } from 'react-toastify';
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

const UserSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
});

const UserManagement = () => {
    const userRole = localStorage.getItem("userRole");

    const [modal, setModal] = useState(false);

    const [User, setUser] = useState([]);
    const [updateMode, setUpdateMode] = useState(false);
    const [updateUser, setSelectedUser] = useState({});

    const toggle = () => setModal(!modal);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: joiResolver(UserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            username: "",
            password: "",
            role: 1
        }
    });

    // Fetch trait Data
    useEffect(() => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/user/')
            .then(res => {
                setUser(res.data);
            })
            .catch(err => console.log(err));
    }, []);

    const handlePassword = (data) => {

    }
    const onSubmit = (data) => {
        if (updateMode) {
            const postData = { ...data, _id: updateUser._id };
            axios.put(process.env.REACT_APP_BACKEND_URL + `/user/${updateUser._id}`, postData)
                .then((res) => {
                    if (res.data.status) {
                        reset({ firstName: "", lastName: "", username: "", password: "", role: 1 });
                        toast.success(res.data.message);
                        toggle();
                        getUser();
                        setUpdateMode(false);
                        setSelectedUser({})
                    } else {
                        toast.warn(res.data.message);
                    }
                })
        } else {
            axios.post(process.env.REACT_APP_BACKEND_URL + '/user', data)
                .then((res) => {
                    if (res.data.status) {
                        reset({ firstName: "", lastName: "", username: "", password: "", role: 1 });
                        toast.success("User Created Successfully!");
                        toggle();
                        getUser();
                    } else {
                        toast.warn("Something Went Wrong!");
                        getUser();
                    }
                })
                .catch((err) => console.log(err?.message));
        }

    };

    const getUser = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/user/')
            .then(res => {
                setUser(res.data);
            })
            .catch(err => console.log(err));
    };

    const selectedUser = (data) => {
        setUpdateMode(true);
        reset({ firstName: data.firstname, lastName: data.lastname, username: data.username, password: data.password, role: 1 });
        setSelectedUser(data);

    };

    const deleteUser = (id) => {
        axios.delete(process.env.REACT_APP_BACKEND_URL + `/user/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.status) {
                // toast.success("User Successfully Deleted!");
                toast.success(res.data.message);
                getUser()
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
                                <h3 className="mb-0">All Users</h3>
                                <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add New User</Button>
                                <Modal isOpen={modal} toggle={toggle}   >
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <ModalHeader toggle={toggle}>
                                            <h3 className="mb-0">{updateMode ? 'Update' : 'Add'} User</h3>
                                        </ModalHeader>
                                        <ModalBody>

                                            <div className="row">
                                                <div className="col-12">
                                                    <label className="form-label">First Name</label>
                                                    <input {...register("firstName")} className="form-control" type="text" placeholder="Enter First Name" />
                                                    {errors.firstName && <p className='form-error'>First Name is Required!</p>}

                                                    <label className="form-label">Last Name</label>
                                                    <input {...register("lastName")} className="form-control" type="text" placeholder="Enter Last Name" />


                                                    <label className="form-label">Username</label>
                                                    <input {...register("username")} className="form-control" type="text" placeholder="Enter Trait Name" />
                                                    {errors.username && <p className='form-error'>Username is Required!</p>}

                                                    <label className="form-label">Password</label>
                                                    <input {...register("password")} className="form-control" type="text" placeholder="Enter Trait Name" />
                                                    {errors.password && <p className='form-error'>Password is Required!</p>}

                                                </div>
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
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>S.No</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Name</th>
                                            <th scope="col" className='text-start align-text-top ps-2 w-50 bg-dark text-white' style={{ maxWidth: '15rem' }}>Username</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                        </tr>
                                    </thead>

                                    <tbody className=''>
                                        {/* {pageData.map((el, index) => { */}
                                        {Array.isArray(User) && User.map((el, index) => {
                                            return (
                                                <tr key={el._id}>
                                                    <td className='text-center ps-1 align-start' style={{ width: '8rem' }}>{index + 1}</td>
                                                    <td className='text-start ps-1 align-start'>{el.firstname} {el.lastname}</td>
                                                    <td className='text-start ps-1 align-start' style={{ maxWidth: '15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.username}</td>
                                                    <td className='text-center ps-1 align-start'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                    <td className='text-center ps-1 '>
                                                        <button className='btn p-2 text-success fs-4' type='button' onClick={() => { selectedUser(el); toggle(); }} > <i className="fa-solid fa-pencil"></i></button>

                                                        {
                                                            userRole === '0' ? <>
                                                                <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash text-danger"></i></button>} position="top right">
                                                                    <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.username}</span>?</div>
                                                                    <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => deleteUser(el._id)}>Delete</button>
                                                                </Popup>
                                                            </> : <></>
                                                        }

                                                        {/* <button className='btn p-2 text-success fs-4' type='button' onClick={() => { selectedUser(el); toggle(); }} >Change Password</button> */}
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

export default UserManagement;
