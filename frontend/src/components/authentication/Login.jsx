import React from "react";
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
import { useDispatch } from "react-redux";
import { setUser,setToken } from "../../slices/authSlice";

const { LOGIN_API } = userAPI;

const Login = () => {

  const dispatch = useDispatch();

  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);

  const navigate = useNavigate();

  const submitLogin = async (e) => {
    e.preventDefault();

    // Basic validation (required)
    setEmailError(!email);
    setPasswordError(!password);

    if (!email || !password) return;

    const toastId = toast.loading("Logging in...");

    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      });

      console.log("Login response:", response?.data);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Login successful!", { id: toastId });

      dispatch(setUser(response?.data?.user))
      dispatch(setToken(response?.data?.token));

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));

      console.log("Display User :", response.data.user, " Token :", response.data.token);

      navigate("/chats");
    } catch (err) {
      console.error("Error during login:", err);
      toast.error("Login failed. Please try again.", { id: toastId });
    }
  };

  return (
    <VStack spacing={4} as="form" onSubmit={submitLogin} width="100%">
      {/* Email Field */}
      <FormControl id="email" isRequired isInvalid={emailError}>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && (
          <FormErrorMessage>This field is required</FormErrorMessage>
        )}
      </FormControl>

      {/* Password Field */}
      <FormControl id="password" isRequired isInvalid={passwordError}>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
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

      {/* Login Button */}
      <Button colorScheme="blue" width="100%" type="submit" mt={4}>
        Login
      </Button>

      {/* Guest User Button */}
      <Button
        colorScheme="red"
        variant="solid"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("guest123");
        }}
      >
        Log In as Guest
      </Button>
    </VStack>
  );
};

export default Login;
