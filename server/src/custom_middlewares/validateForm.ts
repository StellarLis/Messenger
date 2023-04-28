import * as Yup from 'yup';
import { Request, Response, NextFunction } from 'express';

const formSchema = Yup.object({
    username: Yup.string()
        .required('Username is required!')
        .min(6, 'Username is too short!')
        .max(28, 'Username is too long!'),
    password: Yup.string()
        .required('Password is required!')
        .min(6, 'Password is too short!')
        .max(28, 'Password is too long!')
});

const validateForm = (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;
    formSchema.validate(formData)
        .catch(() => {
            res.status(422).send();
        })
        .then(valid => {
            if (valid) {
                next();
            } else {
                res.status(422).send();
            }
        });
}

export default validateForm;