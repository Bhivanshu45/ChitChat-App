import {  Box } from '@chakra-ui/react'
import React from 'react'
import { useSelector } from 'react-redux';
import SingleChat from './SingleChat';

const ChatWindow = ({fetchAgain,setFetchAgain}) => {
  const {selectedChat} = useSelector((state) => state.chat)

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "69.5%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
}

export default ChatWindow
