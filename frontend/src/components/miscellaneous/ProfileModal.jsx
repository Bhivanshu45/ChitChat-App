import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react';
import React from 'react'

const ProfileModal = ({user,children}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();

  return (
    <div>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}

      <Modal size='lg' isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
           fontFamily='Work sans'
           fontSize='1.5rem'
           display='flex'
           justifyContent='center'
          >{user.name}</ModalHeader>
          <ModalCloseButton/>
          <ModalBody
           display='flex'
           flexDirection='column'
           alignItems='center'
           gap={4}
          >
           <Image
             borderRadius='full'
             boxSize='150px'
             src={user.profilePicture}
             alt={user.name}
           />
           <Text color='green' fontSize='1.2rem'>
            Email ID :- {user.email}
           </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ProfileModal
