import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import SearchBar from "../components/chat/SearchBar";

const ChatPage = () => {
  return (
    <Flex height="100vh" width="100vw">
      {/* Left Sidebar */}
      <Flex
        width="30%"
        height="100%"
        direction="column"
        borderRight="1px solid"
        borderColor="gray.300"
        p="10px"
      >
        <SearchBar />
        <ChatList />
      </Flex>

      {/* Right Chat Window */}
      <Flex width="70%" height="100%" direction="column" p="10px" bg="gray.100">
        <ChatWindow />
      </Flex>
    </Flex>
  );
};

export default ChatPage;
