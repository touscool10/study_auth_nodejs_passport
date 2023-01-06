import { Request, Response, NextFunction } from "express";
import passport, { authenticate } from "passport";
import { ExtractJwt, Strategy  as JWTStrategy } from 'passport-jwt';
import { User } from "../models/User";
import * as Jwt from 'jsonwebtoken';

export const notAuthorizedJson = { status: 401, message: "Unauthorized!" };

const options = {
    secretOrKey: process.env.JWT_SECRET as string,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}


//Aqui configura sua Strategy.
passport.use(new JWTStrategy(options, async (payload, done) => {
    if(payload){
        const user = await User.findOne({
            where: {
                id: payload.sub,
                email: payload.email
            }
        });

        if(user){
            return done(null, user);
        } else {
            return done(notAuthorizedJson, false);
        }

    } else {
        return done(notAuthorizedJson, false);
    }
}));

export const privateRoute = (req: Request, res: Response, next: NextFunction) => {
   passport.authenticate('jwt', (err, user) => {
        req.user = user;
        if (user) {
            return next();
        } else {
            return next(notAuthorizedJson);
        }
   })(req, res, next);
}


export const generateToken = (payload: TokenPayloads) => {
    let token = Jwt.sign(
        { email: payload.email, sub: payload.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '2h' }
    );

    return token;
};

export type TokenPayloads = {
    email: string;
    id: string | number;
    password?: string;
}



export default passport;