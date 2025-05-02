import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";

const UserLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, surveyId: localStorage.getItem("postAuthSurveyId") }
      const response = await axios.post(process.env.REACT_APP_BACKEND_URL + "/user/login", payload);
      const { token, role, userId } = response.data;

      // Save the token in localStorage
      localStorage.setItem("authUserToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userId);

      // 1️⃣ add the survey to the user profile if we captured one
      const surveyId = localStorage.getItem("postAuthSurveyId");
      if (surveyId) {
        try {
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/user/survey`,
            { surveyId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Could not register survey on user:", err);
        }
      }

      toast.success("Login successful!");

      // A. Nice path: we have `state.from` (came straight from ProtectedRole2)
      let redirectPath = location.state?.from?.pathname;

      // B. Fallback: maybe the browser refreshed, use localStorage
      if (!redirectPath) {
        redirectPath = "/website/survey-user-dashboard";
      }

      // clean-up so it doesn’t affect future logins
      localStorage.removeItem("postAuthRedirect");
      localStorage.removeItem("postAuthSurveyId");

      navigate(redirectPath, { replace: true });
      // navigate("/admin/index"); // Redirect to the dashboard
    } catch (error) {
      toast.error("Invalid username or password!");
    }
  };
  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-2">
            <div className="text-muted text-center mt-2 ">
              <h1>Login</h1>
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <form onSubmit={handleSubmit}>
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="email"
                    type="email"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange} required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <div className="text-center">
                <Button className="my-4" color="primary" type="submit">
                  Sign in
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            {/* <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Forgot password?</small>
            </a> */}
          </Col>
          <Col className="text-right" xs="6">
            {/* <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Create new account</small>
            </a> */}
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default UserLogin;
