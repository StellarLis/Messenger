import { ChatIcon } from "@chakra-ui/icons";
import { Button, Divider, HStack, Heading, Tab, TabList, VStack, Text, Circle, useDisclosure } from "@chakra-ui/react";
import { useContext } from "react";
import { FriendContext } from "./Home";
import AddFriendModal from "./AddFriendModal";

const Sidebar = () => {
    const {friendList} = useContext(FriendContext);
    const {isOpen, onOpen, onClose} = useDisclosure();
    return (
        <>
        <VStack py='1.4rem'>
            <HStack justify="space-evenly" w="100%">
                <Heading size="md">Add Friend</Heading>
                <Button onClick={onOpen}>
                    <ChatIcon />
                </Button>
            </HStack>
            <Divider />
            <VStack as={TabList}>
                {friendList.map(friend => (
                    <HStack as={Tab} key={`friend:${friend}`}>
                        <Circle background={friend.connected ? "green.500" : "red.500"} w="15px" h="15px"></Circle>
                        <Text>{friend.username}</Text>
                    </HStack>
                ))}
            </VStack>
        </VStack>
        <AddFriendModal isOpen={isOpen} onClose={onClose}/>
        </>
    );
}
 
export default Sidebar;