import React, { useEffect } from "react";
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  HStack,
} from "@chakra-ui/react";
import { LuFolder, LuUser } from "react-icons/lu";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={1}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="2px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" color="black">
          Chit Chat
        </Text>
      </Box>

      <Box
        p={6}
        bg="white"
        w="100%"
        color="black"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Tabs variant="enclosed" isFitted colorScheme="blackAlpha">
          <TabList mb="3" bg="gray.300" borderRadius="md" overflow="hidden">
            <Tab _selected={{ bg: "black", color: "white" }}>
              <HStack spacing={2}>
                <LuUser />
                <Text>Login</Text>
              </HStack>
            </Tab>
            <Tab _selected={{ bg: "black", color: "white" }}>
              <HStack spacing={2}>
                <LuFolder />
                <Text>Signup</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
