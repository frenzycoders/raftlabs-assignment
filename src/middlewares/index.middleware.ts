import { redisClient } from "@connection";
import { IPayload, ISearchQuery, IUser } from "@interface";
import { getUserService } from "@services";
import { verifyToken } from "@utils";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import { Socket, DisconnectReason } from "socket.io";



export const filterRequiredKeys = (schema: any) => {
    let keys = schema;
    let requred: string[] = [];
    for (let key in keys) {
        if (keys[key].required && keys[key].ref == undefined) {
            requred.push(key);
        }
    }
    return requred;
}

export const checkrequiredheaders = (headers: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const header of headers) {
            if (!req.headers[header]) {
                return res.status(400).json({
                    message: `Missing ${header} in request headers`
                })
            }
        }
        next();
    }
}


export const checkrequiredbody = (bodys: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const body of bodys) {
            if (!req.body[body]) {
                return res.status(400).json({
                    message: `Missing ${body} in request body`
                })
            }
        }
        next()
    }
}


export const authenticateUser = (redisRef: Boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token: string | any = req.headers.authorization;
            if (!token)
                throw Error('Missing token in request headers');

            let payload: IPayload = await verifyToken(token);
            let redisData: string | null = await redisClient.get(`${payload._id}`);

            if (redisData) console.log('Redis Data: for Authentication ');

            let user: IUser[] | null = redisData != null ? [JSON.parse(redisData)] : await getUserService({ _id: payload._id, token: token });


            if (!user || user.length == 0)
                throw Error('Invalid token');

            if (redisData == null) redisClient.set(`${payload._id}`, JSON.stringify(user[0]), 'EX', 60 * 2);

            req.user = user[0];
            if (redisRef == true) {
                await redisClient.del(`${user[0]._id}`);
            }
            next();
        } catch (error) {
            res.status(500).send({
                message: error.message,
            })
        }
    }
}

export const searchQuery = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            let search = '';
            if (req.query.search) search = req.query.search as string;
            let searchQuery: ISearchQuery = {
                user: req.user._id.toString(),
                $or: [
                    { name: { $regex: search as string, $options: 'i' } },
                    { model: { $regex: search as string, $options: 'i' } },
                    { price: { $regex: search as string, $options: 'i' } },
                    { color: { $regex: search, $options: 'i' } },
                ],
            }

            req.limit = 10;
            req.page = 0;
            if (req.query.limit) {
                req.limit = parseInt(req.query.limit as string);
            }
            if (req.query.page) {
                req.page = parseInt(req.query.page as string);
            }



            if (req.query.startDate && req.query.endDate) {
                searchQuery.createdAt = {
                    $gte: moment(req.query.startDate as string).toDate(),
                    $lte: moment(req.query.endDate as string).toDate(),
                }
            }

            if (req.query.color) {
                searchQuery.color = req.query.color as string;
            }

            if (req.query.model) {
                searchQuery.model = req.query.model as string;
            }
            if (req.query.sortvalue) {
                console.log(req.query.sortvalue)
                req.sort = parseInt(req.query.sortvalue as string);
            }

            if (req.query.sortKey) req.sortKey = req.query.sortKey as string;

            req.page = req.page * req.limit;
            req.searchQuery = searchQuery;
            next();
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }
}

export const checkrequiredquery = (queries: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const query of queries) {
            if (!req.query[query]) {
                return res.status(400).json({
                    message: `Missing ${query} in request query`
                })
            }
        }
        next();
    }
}

export const checknotrequiredbody = (bodys: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const body of bodys) {
            if (req.body[body]) {
                return res.status(400).json({
                    message: `${body} is not required in request body`
                })
            }
        }
        next();
    }
}


export const authenticateSocketUser = async (socket: Socket, next: any) => {
    try {
        let token: string | any = socket.handshake.auth.authorization;
        if (!token) next(new Error('please add authorization in headers of socket'));
        let payload: IPayload = await verifyToken(token);
        let user: IUser[] | null = await getUserService({ _id: payload._id, token: token });
        if (user == null || user.length == 0) {
            next(new Error('authorization token is expired'));
        } else {
            socket.data.user = user[0];
            next();
        }
    } catch (error) {
        next(new Error(error.message));
    }
}