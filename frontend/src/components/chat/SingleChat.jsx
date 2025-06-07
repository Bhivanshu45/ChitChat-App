import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, IconButton, Text } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedChat } from '../../slices/chatSlice'
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal'
import ProfileModal from '../miscellaneous/ProfileModal'
import { getSender } from '../../utils/getSenderDetail'

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const dispatch = useDispatch();

    const {user} = useSelector((state) => state.auth)
    const {selectedChat} = useSelector((state) => state.chat)

    useEffect(() => {
    },[dispatch])


  return (
    <>
      {selectedChat ? (
        <Box 
        width='100%'
        height='100%'
        overflow='hidden'
        >
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
                    />
                </> 
                ) : (
                <>
                    {selectedChat?.chatName}
                    <ProfileModal user={getSender(user,selectedChat?.users)} />
                </>
            )}
          </Box>

          <Box
            display='flex'
            flexDirection='column'
            p={3}
            justifyContent='flex-end'
            bg='#E8E8E8'
            width='100%'
            height='100%'
            borderRadius='lg'
            overflowY='hidden'
          >
            { }
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
          <Text
            fontSize="1.4rem"
            fontFamily="Work sans"
            fontWeight="semibold"
          >
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat
