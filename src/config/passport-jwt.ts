import passport, { authenticate } from "passport";
import { Request, Response, NextFunction } from 'express';
import { BasicStrategy } from "passport-http";
import { User } from "../models/User";

export const notAuthorized = { status: 401, message: "Unauthorized!" }

//Aqui configura sua Strategy.
passport.use(new BasicStrategy( async (email, password, done) => {

    if (email && password) {
        const user = await User.findOne({
            where: { email, password }
        });

        if (user) {
            return done(null, user);
        } else {
            return done(notAuthorized, false);
        }
    } 
    
    return done(notAuthorized, false);
    
}));

export const privateRoute = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('basic', (err, user) => {
        req.user = user;
        if (user) {
            return next();
        } else {
            return next(notAuthorized);
        }
    })(req, res, next);
}


export default passport;