import React, { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import { apiConnector } from "../../services/apiconnector";
import { userAPI } from "../../services/endpoints/APIs";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../../slices/authSlice";
import { useDispatch } from "react-redux";

const { SIGNUP_API } = userAPI;

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);


  const submitHandler = async (e) => {
    e.preventDefault();
    setNameError(!name);
    setEmailError(!email);
    setPasswordError(!password);
    setConfirmPasswordError(!confirmPassword);
    if (!name || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const toastId = toast.loading("Signing up...");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      const response = await apiConnector("POST", SIGNUP_API, formData);
      if (!response.data.success) throw new Error(response.data.message);

      toast.success("Signup successful!", { id: toastId });

      dispatch(setUser(response?.data?.user))
      dispatch(setToken(response?.data?.token));

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      navigate("/chats");
      
    } catch (err) {
      console.error("Error during signup:", err);
      toast.error("Signup failed. Please try again.", { id: toastId });
    }
  };

  return (
    <VStack
      spacing={2} // Reduced spacing
      as="form"
      onSubmit={submitHandler}
      width="100%"
      maxH="90vh" // Limit total height
      overflowY="auto" // Scroll if still needed
    >
      <FormControl id="name" isRequired isInvalid={nameError}>
        <FormLabel>Full Name</FormLabel>
        <Input
          size="sm" // Compact input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && (
          <FormErrorMessage>This field is required</FormErrorMessage>
        )}
      </FormControl>

      <FormControl id="email" isRequired isInvalid={emailError}>
        <FormLabel>Email Address</FormLabel>
        <Input
          size="sm"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && (
          <FormErrorMessage>This field is required</FormErrorMessage>
        )}
      </FormControl>

      <FormControl id="password" isRequired isInvalid={passwordError}>
        <FormLabel>Password</FormLabel>
        <InputGroup size="sm">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.25rem"
              size="xs"
              variant="ghost"
              onClick={() => setShow(!show)}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        {passwordError && (
          <FormErrorMessage>This field is required</FormErrorMessage>
        )}
      </FormControl>

      <FormControl
        id="confirmPassword"
        isRequired
        isInvalid={confirmPasswordError}
      >
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="sm">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.25rem"
              size="xs"
              variant="ghost"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        {confirmPasswordError && (
          <FormErrorMessage>This field is required</FormErrorMessage>
        )}
      </FormControl>

      <FormControl id="profilePicture">
        <FormLabel>Upload Profile Pic</FormLabel>
        <Input
          type="file"
          size="sm"
          p={1} // Reduced padding
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files[0])}
        />
      </FormControl>

      <Button colorScheme="blue" width="100%" mt={2} size="sm" type="submit">
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
