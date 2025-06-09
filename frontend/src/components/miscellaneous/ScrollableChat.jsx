import { Box, Text,Avatar, Tooltip } from '@chakra-ui/react';
import React from 'react'
import { useSelector } from 'react-redux'
import { isLastMessage, isSameSender } from '../../utils/getSenderDetail';

const ScrollableChat = ({messages}) => {
    
    const {user} = useSelector((state) => state.auth)

  return (
    <Box display="flex" flexDirection="column">
      {!messages || messages.length === 0 ? (
        <Text fontStyle="italic">Let’s Chat Begin!</Text>
      ) : (
        messages.map((message, i) => {
            const isUserSender = message.sender._id === user._id;
            const showAvatar =
              !isUserSender &&
              (isSameSender(messages, message, i) ||
                isLastMessage(messages, i,user._id));
            return (
              <Box
                key={message._id}
                display="flex"
                alignItems="center"
                alignSelf={
                  message.sender._id === user._id ? "flex-end" : "flex-start"
                }
                mb={isSameSender(messages, message, i) ? 3 : 1}
              >
                {showAvatar ? (
                  <Tooltip
                    label={message.sender.name}
                    hasArrow
                    placement="bottom-start"
                  >
                    <Avatar
                      cursor="pointer"
                      mr={1}
                      size="sm"
                      src={message.sender.profilePicture}
                    />
                  </Tooltip>
                ) : (
                  <Box w="32px" mr={1} />
                )}
                <Text
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={isUserSender ? "skyblue" : "lightgreen"}
                >
                  {message.content}
                </Text>
              </Box>
            );})
      )}

    </Box>
  );
}

export default ScrollableChat
