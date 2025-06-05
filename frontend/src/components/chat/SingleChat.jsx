import { ArrowBackIcon } from '@chakra-ui/icons'
import { IconButton, Text } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedChat } from '../../slices/chatSlice'

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const dispatch = useDispatch();

    const {selectedChat} = useSelector((state) => state.chat)

    useEffect(() => {
    },[dispatch])


  return (
    <div>
      {selectedChat ? (
        <Text>
          <IconButton
            display={{ base: "flex", md: "none" }}
            icon={<ArrowBackIcon />}
            onClick={() => dispatch(setSelectedChat(""))}
          />
          {selectedChat?.chatName}
        </Text>
      ) : (
        <Text>Click on a user to start chatting</Text>
      )}
    </div>
  );
}

export default SingleChat
