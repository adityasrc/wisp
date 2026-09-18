import { jwtVerify } from "jose";
import type { NextFunction, Request, Response } from "express";

export const middleware = async function (req: Request, res: Response, next: NextFunction) {

    try {

        const token = req.cookies.token;
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const { payload } = await jwtVerify(token, secret);
        console.log(payload);
        req.user = {
            id: payload.sub as string,
        };
        next();

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Unauthorized" });
    }

}


