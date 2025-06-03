import { Button } from '@chakra-ui/react'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/authSlice';

const ChatWindow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout());

    // Clear localStorage/sessionStorage if used
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login or homepage
    navigate("/");

  }

  return (
    <div>
      <Button
      onClick={logoutHandler}>
        LogOUt
      </Button>
    </div>
  )
}

export default ChatWindow
