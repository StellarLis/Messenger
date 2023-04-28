import * as Yup from 'yup';

const friendSchema = Yup.object({
    friendName: Yup.string()
        .required('Username required')
        .min(6, 'Invalid username!')
        .max(28, 'Invalid username!')
});

export default friendSchema;