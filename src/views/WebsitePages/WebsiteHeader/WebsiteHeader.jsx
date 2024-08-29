import React from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { MdEmail } from "react-icons/md";
import { FaSquareXTwitter, FaWhatsapp } from "react-icons/fa6";
import BrandLogo from  '../../../assets/img/brand/decision-support-logo.png'


const WebsiteHeader = () => {
    return (
        <>
            
            <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home"><img src={BrandLogo} alt="Brand Logo" className='w-25' /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link href="#features">Home</Nav.Link>
                            <NavDropdown title="What We Offer" id="collapsible-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1">Products</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2"> Services</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Contact Us" id="collapsible-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1"><MdEmail /></NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.1"><FaSquareXTwitter /></NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.1"><FaWhatsapp /></NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        {/* <Nav>
                            <Nav.Link href="#deets">More deets</Nav.Link>
                            <Nav.Link eventKey={2} href="#memes">
                                Dank memes
                            </Nav.Link>
                        </Nav> */}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default WebsiteHeader
