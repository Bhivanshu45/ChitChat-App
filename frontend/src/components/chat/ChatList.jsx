import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Flex,
  Spinner,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../../services/apiconnector";
import { chatAPI } from "../../services/endpoints/APIs";
import { setSelectedChat, setChats } from "../../slices/chatSlice";
import { setLoading } from "../../slices/authSlice";
import { AddIcon } from "@chakra-ui/icons";
import GroupChatModal from "../miscellaneous/GroupChatModal";

const { GET_ALL_CHATS_API } = chatAPI;

const ChatList = ({ fetchAgain }) => {
  const dispatch = useDispatch();
  const { chats, selectedChat, loading } = useSelector((state) => state.chat);
  const { user, token } = useSelector((state) => state.auth);

  const [loggedUser, setLoggedUser] = useState();

  const bgSelected = useColorModeValue("blue.100", "blue.700");
  const bgUnselected = useColorModeValue("white", "gray.800");
  const bgHover = useColorModeValue("blue.50", "blue.600");
  const bgList = useColorModeValue("gray.50", "gray.700");

  const fetchChats = async () => {
    try {
      dispatch(setLoading(true));

      const response = await apiConnector("GET", GET_ALL_CHATS_API, null, {
        Authorization: `Bearer ${token}`,
      });

      console.log("Chats response:", response?.data);
      console.log("User Populated : ", user);

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Failed to fetch chats");
      }

      // Assume response.data is the desired payload
      dispatch(setChats(response?.data?.chats || []));
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      width={{ base: "100%", md: "30%" }}
      height="100%"
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      overflowY="auto"
      gap={2}
      p={3}
      borderRadius="md"
      borderWidth="1px"
      bg="white"
    >
      <Box
        display="flex"
        width="100%"
        fontFamily="Work sans"
        justifyContent="space-between"
        p={3}
        alignItems="center"
        fontSize="xl"
        fontWeight="bold"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flex="1"
        >
          <Spinner size="lg" color="blue.500" />
        </Box>
      ) : chats && chats.length > 0 ? (
        chats.map((chat) => (
          <Flex
            key={chat._id}
            onClick={() => dispatch(setSelectedChat(chat))}
            bg={selectedChat?._id === chat._id ? bgSelected : bgUnselected}
            _hover={{
              bg: bgHover,
              cursor: "pointer",
            }}
            p={3}
            gap={4}
            borderRadius="md"
            borderWidth="1px"
            boxShadow="sm"
            alignItems="center"
          >
            <Box>
              <Avatar
                size="md"
                src={
                  chat.isGroupChat
                    ? "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                    : chat?.users?.find((u) => u._id !== user._id)
                        ?.profilePicture
                }
              />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="bold">
                {chat.isGroupChat
                  ? chat.chatName
                  : chat?.users?.find((u) => u._id !== user._id)?.name}
              </Text>
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {chat.latestMessage?.content || "No messages yet"}
              </Text>
            </Box>
          </Flex>
        ))
      ) : (
        <Text fontSize="md" color="gray.500" textAlign="center">
          No chats available. Start a new conversation!
        </Text>
      )}
    </Box>
  );
};

export default ChatList;
