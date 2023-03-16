import { IVehicle, IVehicleSearchArgs } from "@interface";
import { createVehicleService, deleteVehicleService, loadVehicleService, updateVehicleService } from "@services";
import { Request, Response } from "express";
import { io } from "./../../server";

export const createVehicleLogic = async (req: Request, res: Response) => {
    try {
        let body: IVehicle = req.body;
        body.user = req.user._id;

        let vehicle: IVehicle = await createVehicleService(body);
        
        io.to(req.user._id.toString()).emit('DATA_CREATION', { 'schema': 'vehicle', 'data': vehicle })
        
        res.status(201).send({ message: 'Vehicle created', vehicle });
    } catch (error) {
        res.status(500).send({
            message: error.message,
        })
    }
}

export const getVehicleLogic = async (req: Request, res: Response) => {
    try {
        let query: IVehicleSearchArgs = {
            query: req.searchQuery,
            limit: req.limit,
            skip: req.page,
            sortKey: req.sortKey as any,
            sortValue: req.sort,
        }
        let data: { count: number, vehicle: IVehicle[] } = await loadVehicleService(query);
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message,
        })
    }
}

export const deleteVehicleLogic = async (req: Request, res: Response) => {
    try {
        let { vid } = req.query;
        await deleteVehicleService(vid as string);
        res.status(200).send({ message: 'Vehicle deleted' });
    } catch (error) {
        res.status(500).send({
            message: error.message,
        })
    }
}

export const updateVehicleLogic = async (req: Request, res: Response) => {
    try {
        let { vid } = req.query;
        let body: IVehicle = req.body;
        let vehicle: IVehicle | any = await updateVehicleService({ _id: vid }, body);
        io.to(req.user._id.toString()).emit('DATA_UPDATE', { 'schema': 'vehicle', vehicle })
        res.status(200).send({
            message: 'vehicle updated',
            vehicle,
        })
    } catch (error) {
        res.status(500).send({
            message: error.message,
        })
    }
}