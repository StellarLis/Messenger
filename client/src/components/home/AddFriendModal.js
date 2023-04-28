import { Button, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import TextField from '../TextField';
import { Form, Formik } from 'formik';
import friendSchema from '../FriendSchema';
import socket from '../../socket';
import { useCallback, useContext, useState } from 'react';
import {FriendContext, SocketContext} from './Home';

const AddFriendModal = ({isOpen, onClose}) => {
    const [error, setError] = useState('');
    const closeModal = useCallback(
        () => {
            setError('');
            onClose();
        },
        [onClose]
    );
    const {setFriendList} = useContext(FriendContext);
    const { socket } = useContext(SocketContext);
    return (
        <Modal isOpen={isOpen} onClose={closeModal} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add a friend</ModalHeader>
                <ModalCloseButton />
                <Formik
                    initialValues={{ friendName: "" }}
                    onSubmit={(values, actions) => {
                        socket.emit('add_friend', values.friendName, ({errorMsg, done}) => {
                            if (done) {
                                setFriendList(c => [values.friendName, ...c]);
                                closeModal();
                                return;
                            }
                            setError(errorMsg);
                        });
                    }}
                    validationSchema={friendSchema}
                    >
                    <Form>
                        <ModalBody>
                            <Heading as='p' color='red.500' textAlign='center'fontSize='xl'>
                                {error}
                            </Heading>
                            <TextField label='Friend`s name' placeholder='Enter friend`s username'
                                autoComplete='off' name='friendName'/>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' type='submit'>
                                Submit
                            </Button>
                        </ModalFooter>
                    </Form>
                </Formik>
            </ModalContent>
        </Modal>
    );
}
 
export default AddFriendModal;