import { VStack, ButtonGroup, FormControl, FormLabel, Button, FormErrorMessage,
 Input, Heading, Text } from "@chakra-ui/react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext, useState } from "react";
import { AccountContext } from "../AccountContext";

const Login = () => {
    const {setUser} = useContext(AccountContext);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {username: "", password: ""},
        validationSchema: Yup.object({
            username: Yup.string()
                .required("Username required!")
                .min(6, "Username too short!")
                .max(28, "Username too long!"),
            password: Yup.string()
            .required("Password required!")
            .min(6, "Password too short!")
            .max(28, "Password too long!"),
        }),
        onSubmit: (values, actions) => {
            const vals = {...values};
            actions.resetForm();
            axios.post('http://localhost:4000/auth/login', {
                username: vals.username,
                password: vals.password
            }, { withCredentials: true }).catch(err => {
                console.log(err);
                return;
            }).then(res => {
                if (!res || res.status >= 400) {
                    return;
                }
                setUser({...res.data});
                if (res.data.status) {
                    setError(res.data.status);
                } else if (res.data.loggedIn) {
                    localStorage.setItem('token', res.data.token);
                    navigate('/home');
                }
            });
        }
    });
    return (
        <VStack as="form" w={{base: '90%', md: "500px"}} m="auto"
            justify="center" h="100vh" spacing="1rem" onSubmit={formik.handleSubmit}>
            <Heading>Log In</Heading>
            <Text as='p' color='red.500'>
                {error}
            </Text>
            <FormControl isInvalid={formik.errors.username && formik.touched.username}>
                <FormLabel fontSize="lg">Username</FormLabel>
                <Input name="username" placeholder="Enter username" autoComplete="off" size="lg"
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    value={formik.values.username} />
                <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={formik.errors.password && formik.touched.password}>
                <FormLabel fontSize="lg">Password</FormLabel>
                <Input name="password" placeholder="Enter password" autoComplete="off" size="lg"
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    value={formik.values.password} type="password"/>
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
            </FormControl>
            <ButtonGroup>
                <Button colorScheme="teal" type="submit">Log In</Button>
                <Button onClick={() => navigate('/register')}>Create Account</Button>
            </ButtonGroup>
        </VStack>
    );
}
 
export default Login;