import { NextFunction, Request, Response } from 'express';

import { streamUpload } from '../../helpers/streamUpload.helper';

export const uploadSingle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req['file']) {
    try {
      const result = await streamUpload(req['file'].buffer);
      req.body[req['file'].fieldname] = result['url'];
      next();
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Error uploading file"
      });
    }
  } else {
    next();
  }
};

export const uploadFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  for (const key in req['files']) {
    req.body[key] = [];

    const array = req['files'][key];
    for (const item of array) {
      try {
        const result = await streamUpload(item.buffer);
        req.body[key].push(result['url']);
      } catch (error) {
        console.log(error);
      }
    }
  }

  next();
};
