import { Request, Response } from "express";

const handleFrontendSignal = (req: Request, res: Response) => {
    console.log('signal received.');
    res.status(201).json({status: 200, data: "Success!!!"});
}

module.exports = handleFrontendSignal;