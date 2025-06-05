import React, { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { useSelector } from "react-redux";

const ChatPage = () => {
  const [fetchAgain,setFetchAgain] = useState(false)
  const {user} = useSelector((state) => state.auth)
  const {selectedChat} = useSelector((state) => state.chat)
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}

      <Box
        display='flex'
        justifyContent="space-between"
        width="100%"
        height="91.5vh"
        padding="10px"
      >
        {user && <ChatList fetchAgain={fetchAgain} />}
        {user && (
          <ChatWindow fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
