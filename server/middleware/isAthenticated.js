import jwt from "jsonwebtoken"

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "user not authenticated",
                success: false
            })
        }
        //checking if token is avalible then verify it
        const decode = await jwt.verify(token, process.env.JWT_SECRET)

        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            })
        }

        req.id = decode.id;
        next();

    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({
            message: "Token is invalid",
            success: false,
        });
    }
}


export default isAuthenticated;