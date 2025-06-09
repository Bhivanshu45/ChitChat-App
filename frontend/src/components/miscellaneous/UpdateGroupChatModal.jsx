import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import UserBadgeItem from './UserBadgeItem';
import { chatAPI } from '../../services/endpoints/APIs';
import { userAPI } from '../../services/endpoints/APIs';
import { apiConnector } from '../../services/apiconnector';
import { setSelectedChat } from '../../slices/chatSlice';
import UserListItem from './UserListItem';
import toast from 'react-hot-toast';

const {REMOVE_USER_FROM_GROUP, RENAME_GROUP_API,ADD_USER_TO_GROUP,LEAVE_GROUP_API} = chatAPI
const {SEARCH_USER_API} = userAPI

const UpdateGroupChatModal = ({fetchAgain,setFetchAgain,fetchMessages}) => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    const dispatch = useDispatch()

    const {selectedChat} = useSelector((state) => state.chat)
    const {user,token} = useSelector((state) => state.auth)

    const [groupChatName,setGroupChatName] = useState('')
    const [search,setSearch] = useState('');
    const [searchResult,setSearchResult] = useState([]);
    const [loading,setLoading] = useState(false);
    const [renameLoading,setRenameLoading] = useState(false);

    const handleSearch = async (query) => {
      if (!query) {
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await apiConnector("GET",`${SEARCH_USER_API}?search=${query}`,null,{
            Authorization: `Bearer ${token}`,
          });
        if (!response.data?.success) {
          throw new Error(response.data.message);
        }

        // console.log("Search Result : ", response?.data?.users);

        setSearchResult(response?.data?.users);
        setLoading(false);

      } catch (error) {
        console.error(err.message);
        toast.error("Didn't get User");
        setLoading(false);
      }
    };

    const handleRemove = async(userId) => {
        if(!userId){
            return;
        }

        if (
          user._id !== selectedChat.groupAdmin._id &&
          userId !== user._id
        ) {
          toast.error("Only admin can remove");
          return;
        }

        try{
            setLoading(true);

            const response = await apiConnector('PUT',REMOVE_USER_FROM_GROUP,{chatId: selectedChat._id , userId: userId},{
                Authorization: `Bearer ${token}`,
            })

            // console.log("Remove User Res : ",response)

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            dispatch(setSelectedChat(response.data.groupChat));
            setFetchAgain(!fetchAgain)
            fetchMessages()
            setLoading(false)
        }catch(err){
            console.error(err.message)
            toast.error("User not Removed,Try again")
            setLoading(false);
        }
    }

    const handleRename = async() => {
        if (!groupChatName) return;

        if (user._id !== selectedChat.groupAdmin._id) {
          toast.error("Only admin can rename Group");
          return;
        }

        try{
            setRenameLoading(true)

            const response = await apiConnector("PUT",RENAME_GROUP_API,{
                chatId: selectedChat._id,
                chatName: groupChatName
            },{
                Authorization: `Bearer ${token}`,
            })

            console.log("Rename Response : ",response)

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            dispatch(setSelectedChat(response.data.groupChat))
            setFetchAgain(!fetchAgain);
            setRenameLoading(false)

        }catch(err){
            console.error(err.message)
            toast.error("Group rename failed")
            setRenameLoading(false);
        }
        setGroupChatName('')
    }

    const addUserToGroup = async(userToAdd) => {
        if (selectedChat.users.some((u) => u._id === userToAdd)) {
            toast.error("User already added")
            return;
        }
        try{
            const response = await apiConnector("PUT",ADD_USER_TO_GROUP,{chatId:selectedChat._id,userId : userToAdd},{
                Authorization: `Bearer ${token}`,
            })

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            dispatch(setSelectedChat(response.data.groupChat));
            setFetchAgain(!fetchAgain);
            setSearch("");
            setSearchResult([]);

        }catch(err){
            console.error(err.message);
            toast.error("User not added yet");
            return;
        }
    }

    const handleLeave = async(userId) => {
        if(!userId){
            return;
        }
        try{
            setLoading(true)
            const response = await apiConnector(
              "PUT",
              LEAVE_GROUP_API,
              { chatId : selectedChat._id, userId: userId },
              {
                Authorization: `Bearer ${token}`,
              }
            );

            console.log("Leave Group : ",response)

            if (!response.data.success) {
              throw new Error(response.data.message);
            }

            dispatch(setSelectedChat(null));
            
            onClose();
            setSearch("");
            setSearchResult([]);
            setGroupChatName("");
            setFetchAgain(!fetchAgain);

            setLoading(false)

        }catch(err){
            console.error(err.message);
            toast.error("User not added yet");
            setLoading(false)
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
    <div>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontFamily="Work sans"
            fontSize="1.5rem"
            display="flex"
            justifyContent="center"
          >
            {selectedChat?.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={4}
          >
            <Box>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat?.groupAdmin?._id}
                  handleFunction={() => handleRemove(u._id)}
                />
              ))}
            </Box>
            <FormControl display="flex" gap={2}>
              <Input
                placeholder={selectedChat.chatName}
                mb={3}
                value={groupChatName}
                border="gray.700"
                borderWidth="3px"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: John, Piyush"
                mb={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner ml="auto" display="flex" />
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => addUserToGroup(u._id)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              isLoading={loading}
              onClick={() => handleLeave(user._id)}
            >
              Leave
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UpdateGroupChatModal
