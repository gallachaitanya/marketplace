//importing all the required libraries
import Container from "react-bootstrap/Container";
import Axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { getError } from "../utils";
import PasswordStrengthBar from "react-password-strength-bar";
import PasswordChecklist from "react-password-checklist";

//function to display the signUp screen
export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectUrl ? redirectUrl : "/";

  const [email, setEmail] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  //handler to handle the signUp process
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const validPassword = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    );
    if (!validPassword.test(password)) {
      toast.error("Password doesn't meet the minimum requirements");
      return;
    }
    const target = email.split("@");
    const name = firstname + " " + lastname;
    if (target[1] !== "my.unt.edu") {
      toast.error("Email should consist domain @my.unt.edu");
      return;
    }
    try {
      const { data } = await Axios.post("/api/users/signup", {
        name,
        email,
        password,
      });
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/");
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Container className='small-container'>
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className='my-3'>Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='firstname'>
          <Form.Label>First Name</Form.Label>
          <Form.Control
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='lastname'>
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            required
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='email'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthBar password={password} />
        </Form.Group>
        <Form.Group className='mb-3' controlId='confirmPassword'>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type='password'
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <PasswordChecklist
          rules={["minLength", "specialChar", "number", "capital", "match"]}
          minLength={8}
          value={password}
          valueAgain={confirmPassword}
        />
        <div className='mb-3'>
          <Button type='submit'>Sign Up</Button>
        </div>
        <div className='mb-3'>
          Already have an account?{" "}
          <Link to={`/signin?redirect=${redirect}`}>Login</Link>
        </div>
      </Form>
    </Container>
  );
}
