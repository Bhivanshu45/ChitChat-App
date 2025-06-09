import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box,Input, FormControl, IconButton, Spinner, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNotifications, setSelectedChat } from '../../slices/chatSlice'
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal'
import ProfileModal from '../miscellaneous/ProfileModal'
import { getSender } from '../../utils/getSenderDetail'
import { messageAPI } from '../../services/endpoints/APIs'
import { apiConnector } from '../../services/apiconnector'
import ScrollableChat from '../miscellaneous/ScrollableChat'
import {io} from 'socket.io-client'
import { useRef } from 'react'
import Lottie from 'lottie-react'
import animationData from "../../animation/typing.json"

const { SEND_MESSAGE_API ,GET_CHAT_MESSAGES} = messageAPI

const socket = io("http://localhost:8000",{withCredentials:true})

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const dispatch = useDispatch();
    const typingTimeout = useRef(null)

    const {user,token} = useSelector((state) => state.auth)
    const {selectedChat,notifications} = useSelector((state) => state.chat)

    const [loading,setLoading] = useState(false)
    const [messages,setMessages] = useState([])
    const [newMessage,setNewMessage] = useState('');
    const [socketConnected,setSocketConnected] = useState(false);

    const [isTyping,setIsTyping] = useState(false)

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    const sendMessage = async(event) => {
        if(event.key === 'Enter' && newMessage){
            try{
                const response = await apiConnector('POST',SEND_MESSAGE_API,{
                    content: newMessage,
                    chatId: selectedChat._id
                },{
                    Authorization: `Bearer ${token}`,
                })

                // console.log("Send Message Res :",response)

                if(!response.data.success){
                    throw new Error(response.data.message)
                }

                setNewMessage("")
                socket.emit("new message", response.data.newMessage);
                setMessages([...messages, response.data.newMessage]);
            }catch(err){
                console.error(err.message)
                toast.error("message not sent")
                return
            }
        }
    }

    const fetchMessages = async() => {
        if(!selectedChat){
            return
        }

        try{
            setLoading(true);
            const response = await apiConnector("GET",`${GET_CHAT_MESSAGES}/${selectedChat._id}`,null,{
                Authorization: `Bearer ${token}`,
            })
            // console.log("fetch message : ",response)

            if (!response.data.success) {
              throw new Error(response.data.message);
            }

            setMessages(response.data.messages)
            dispatch(setNotifications(notifications.filter((msg) => msg.chat._id !== selectedChat._id)))
            setLoading(false)

            socket.emit('join chat',selectedChat._id)

        }catch(err){
            console.error(err.message);
            toast.error("message fetching failed");
            setLoading(false)
            return;
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value)

        if(!socketConnected) return;

        if(!isTyping){
          socket.emit("typing", {roomId:selectedChat._id,userId:user._id});
        }

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          socket.emit("stop typing", {roomId:selectedChat._id,userId:user._id});
        }, 3000); // try to stop typing after 3 second
    }

    useEffect(() => {
        fetchMessages()
    },[selectedChat])

    useEffect(() => {
        socket.emit('setup',user)
        socket.on('connected',() => {
            setSocketConnected(true)
        })
    },[])


    useEffect(() => {
      socket.on("typeIndication", (userId) => {
          setIsTyping(true);
      });
      socket.on("stop indication", (userId) => {
          setIsTyping(false)
      });
      socket.on("message received", (newMessageReceived) => {
        console.log("received msg for chat: ", newMessageReceived.chat._id);
        console.log("selectedChat currently: ", selectedChat?._id);
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // give notification
          const updatedNotifications = notifications.filter(
            (n) => n.chat._id !== newMessageReceived.chat._id
          );
          dispatch(setNotifications([...updatedNotifications, newMessageReceived]));
          setFetchAgain(!fetchAgain);
          
        } else {
          setMessages((prev) => [...prev, newMessageReceived]);
        }
      });

      return () => {
        socket.off("typeIndication");
        socket.off("stop indication");
        socket.off("message received");
      };
    }, [selectedChat,notifications]);

    useEffect(() => {
      socket.emit("join chat", selectedChat?._id);

      return () => {
        if (selectedChat?._id) socket.emit("leave chat", selectedChat._id);
      };
    }, [selectedChat]);
    

    console.log("Notification : ",notifications)

  return (
    <>
      {selectedChat ? (
        <Box width="100%" height="100%" display="flex" flexDirection="column">
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            px={3}
            py={2}
            width="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => dispatch(setSelectedChat(""))}
            />

            {selectedChat?.isGroupChat ? (
              <>
                {selectedChat?.chatName}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            ) : (
              <>
                {selectedChat?.chatName}
                <ProfileModal user={getSender(user, selectedChat?.users)} />
              </>
            )}
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            flex="1"
            p={3}
            bg="gray.400"
            borderRadius="lg"
            overflowY="auto"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <ScrollableChat messages={messages} />
            )}

            <FormControl onKeyDown={sendMessage} isRequired>
              {isTyping && selectedChat && (
                <Box fontStyle="italic" fontSize="sm" mb={3}>
                  <Lottie
                    animationData={animationData}
                    loop
                    style={{ width: 70, marginLeft: 0, marginBottom: 15 }}
                  />
                </Box>
              )}

              <Input
                variant="outline"
                bg="white"
                placeholder="Enter a message.."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </Box>
      ) : (
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Text fontSize="1.4rem" fontFamily="Work sans" fontWeight="semibold">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat
