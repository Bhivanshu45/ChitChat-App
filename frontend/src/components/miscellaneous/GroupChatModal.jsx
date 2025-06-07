import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { apiConnector } from '../../services/apiconnector';
import { userAPI } from '../../services/endpoints/APIs';
import { chatAPI } from '../../services/endpoints/APIs';
import UserListItem from './UserListItem';
import UserBadgeItem from './UserBadgeItem';
import { setChats, setSelectedChat } from '../../slices/chatSlice';

const {SEARCH_USER_API} = userAPI;
const {CREATE_GROUPCHAT_API} = chatAPI;

const GroupChatModal = ({children}) => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [chatName,setChatName] = useState('')
    const [users,setUsers] = useState([])
    const [search,setSearch] = useState('');
    const [searchResult,setSearchResult] = useState([])
    const [loading ,setLoading] = useState(false);

    const dispatch = useDispatch();

    const {chats} = useSelector((state) => state.chat);
    const {user,token} = useSelector((state) => state.auth)

    const handleSearch = async(query) => {

        if(!query){
            return;
        }
        
        try{
            setLoading(true)

            const response = await apiConnector("GET",`${SEARCH_USER_API}?search=${query}`,null,{
                      Authorization: `Bearer ${token}`,
                    })
            
            if(!response.data?.success){
                throw new Error(response.data.message)
            }

            console.log("Search Result : ", response?.data?.users);
            
            setSearchResult(response?.data?.users)
            setLoading(false)

        }catch(err){
            console.error(err.message)
            toast.error("Didn't get User")
            setLoading(false)
        }
    }

    const handleGroup = (userToAdd) => {
      if (users.some((u) => u._id === userToAdd._id)) {
        toast.error("User already Added")
        return;
      }

      setUsers([...users, userToAdd]);
      setSearch('')
      setSearchResult((prev) => prev.filter((u) => u._id !== userToAdd._id));
    };

    const handleDelete = (userToDelete) => {
        if(!users.includes(userToDelete)){
            toast.error("User not added");
            return;
        }

        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id))
        setSearch("");
        setSearchResult([])
    }

    const handleCreation = async() => {
        if(!chatName){
            toast.error("Enter Group Name");
            return;
        }
        if(!(users && users.length > 1)){
            toast.error("Add more users");
            return;
        }

        try{
            const response = await apiConnector("POST",CREATE_GROUPCHAT_API , {users:users ,chatName:chatName} , {
                Authorization: `Bearer ${token}`,
            } )

            if(!response?.data.success){
                throw new Error(response.data.message)
            }

            console.log("Create Group : ",response.data.groupChat);

            const createdChat = response.data.groupChat;

            dispatch(setChats([...chats,createdChat]))
            dispatch(setSelectedChat(createdChat))

            onClose()
            toast.success("New Group Chat Created!")

        }catch(err){
            console.log(err.message)
            toast.error("didn't create Group")
            return
        }
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch(search);
        },400)

        return () => clearTimeout(delayDebounce)
    },[search])


  return (
    <div>
      <span onClick={onOpen}>{children}</span>

      <Modal size="lg" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontFamily="Work sans"
            fontSize="1.4rem"
            fontWeight="semibold"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody
            p={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add Users eg: John, Piyush"
                mb={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FormControl>

            {/* selected users */}
            <Box
              px={3}
              width="100%"
              display="flex"
              flexWrap="wrap"
              gap={3}
              mb={2}
            >
              {users &&
                users?.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={user._id}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
            </Box>

            {/* render search users */}
            {loading ? (
              <Spinner ml="auto" display="flex" />
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleGroup(u)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter display="flex" gap={4}>
            <Button colorScheme="blue" onClick={handleCreation}>
              Create Chat
            </Button>
            <Button colorScheme="red" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default GroupChatModal
