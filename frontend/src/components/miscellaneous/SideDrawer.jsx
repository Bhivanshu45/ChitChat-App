import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu ,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure
} from "@chakra-ui/react";

import {ChevronDownIcon} from "@chakra-ui/icons"
import { useDispatch, useSelector } from 'react-redux';
import ProfileModal from './ProfileModal';
import { logout } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiConnector } from '../../services/apiconnector';
import { userAPI } from '../../services/endpoints/APIs';
import { chatAPI } from '../../services/endpoints/APIs';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';
import { setChats, setNotifications, setSelectedChat } from '../../slices/chatSlice';
import { getSender } from '../../utils/getSenderDetail';

const {SEARCH_USER_API} = userAPI;
const {ACCESS_CHAT_API} = chatAPI;

const SideDrawer = ({fetchAgain, setFetchAgain}) => {
    const [search,setSearch] = useState('');
    const [searchResult,setSearchResult] = useState([]);
    const [loadingChat,setLoadingChat] = useState(false)
    const [loading,setLoading] = useState(false);

    const {user,token} = useSelector((state) => state.auth);
    const {chats,selectedChat,notifications} = useSelector((state) => state.chat)

    const navigate = useNavigate();
    const dispatch = useDispatch();

    
  const { isOpen, onOpen, onClose } = useDisclosure();

    const logoutHandler = () => {
      dispatch(logout());

      // Clear localStorage/sessionStorage if used
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login or homepage
      navigate("/");
    };

    const handleSearch = async(search) => {
      if(!search){
        return;
      }

      try{
        setLoading(true);

        const response = await apiConnector("GET",`${SEARCH_USER_API}?search=${search}`,null,{
          Authorization: `Bearer ${token}`,
        })

        if(!response.data?.success){
          throw new Error(response.data.message)
        }

        setSearchResult(response?.data?.users)
        setLoading(false)

      }catch(err){
        console.error(err.message)
        toast.error(err?.response?.data?.message || "Something went wrong")
        return;
      }
    }

    const accessChat = async(userId) => {
      try {
        setLoadingChat(true);
        
        const response = await apiConnector("POST", ACCESS_CHAT_API,{userId} ,{
          Authorization: `Bearer ${token}`,
        });

        console.log("Access Chat :",response.data)

        if(!response.data.success){
          throw new Error(response.data.message)
        }
        
        const fetchedChat = response.data.chat;
  
        if (!chats.find((c) => c._id === fetchedChat._id)){ 
          setChats([fetchedChat, ...chats])
        };
        
        dispatch(setSelectedChat(fetchedChat));
        setLoadingChat(false)
        setFetchAgain(!fetchAgain)
        onClose()

      } catch (error) {
        toast.error("Error in fetching Chat")
        return;
      }
    }

    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        handleSearch(search);
      }, 400);

      return () => clearTimeout(delayDebounce);
    },[search])

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        width="100%"
        padding="5px 10px 5px 10px"
        borderWidth="4px"
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} paddingX={3}>
              Search Users
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="1.6rem" fontWeight="semibold" fontFamily="work sans">
          Chit - Chat
        </Text>
        <Box display="flex" gap={4}>
          <Menu>
            <MenuButton padding={1} position="relative">
              <i
                className="fa-solid fa-bell"
                style={{ fontSize: "1.5rem" }}
              ></i>
              {notifications.length > 0 && (
                <Badge
                  position="absolute"
                  top="0"
                  right="0"
                  transform="translate(25%, -25%)"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  fontSize="0.7em"
                  px={2}
                  py={1}
                >
                  {notifications.length}
                </Badge>
              )}
            </MenuButton>

            <MenuList p={2}>
              {!notifications.length
                ? "no New Messages"
                : notifications.map((notif) => (
                    <MenuItem
                      key={notif._id}
                      onClick={() => {
                        dispatch(setSelectedChat(notif.chat));
                        dispatch(
                          setNotifications(
                            notifications.filter((n) => n._id !== notif._id)
                          )
                        );
                      }}
                    >
                      {notif.chat.isGroupChat
                        ? `New Message from ${notif.sender.name} in ${notif.chat.chatName}`
                        : `New Message from ${notif.sender.name}`}
                    </MenuItem>
                  ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user?.name}
                src={user?.profilePicture}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
