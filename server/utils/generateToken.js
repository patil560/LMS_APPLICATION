import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
    return token
}      