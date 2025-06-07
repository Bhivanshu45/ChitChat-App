import React, { useEffect, useState } from 'react'
import {
  Avatar,
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
import { setChats, setSelectedChat } from '../../slices/chatSlice';

const {SEARCH_USER_API} = userAPI;
const {ACCESS_CHAT_API} = chatAPI;

const SideDrawer = ({fetchAgain, setFetchAgain}) => {
    const [search,setSearch] = useState('');
    const [searchResult,setSearchResult] = useState([]);
    const [loadingChat,setLoadingChat] = useState(false)
    const [loading,setLoading] = useState(false);

    const {user,token} = useSelector((state) => state.auth);
    const {chats,selectedChat} = useSelector((state) => state.chat)

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
        <div>
          <Menu>
            <MenuButton padding={1}>
              <i className="fa-solid fa-bell"></i>
            </MenuButton>
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
        </div>
      </Box>
      <Drawer
       placement='left'
       onClose={onClose}
       isOpen={isOpen}
      >
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader>
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display='flex' pb={2}>
              <Input
              placeholder='Search by name or email'
              mr={2}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              />
              
            </Box>
            {loading ? (
              <ChatLoading/>
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => accessChat(user._id)}
                />
              ))
            ) }

            {loadingChat && <Spinner ml='auto' display='flex' />}
          </DrawerBody>
        </DrawerContent>
        
      </Drawer>
    </>
  );
}

export default SideDrawer;
