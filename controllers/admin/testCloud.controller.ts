import { Request, Response } from 'express';
import TestCloud from '../../models/testCloud.model';
import { generateRandomString } from '../../helpers/generate.helper';
import md5 from 'md5';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/testCloud/index.pug', {
    pageTitle: 'Test Cloud',
  });
};

export const postImage = async (req: Request, res: Response) => {
  console.log(req.body);

  // const data = {
  //   testCloudimage: req.body.testCloud || '',
  // };
  // await TestCloud.create(data);

  res.render('admin/pages/testCloud/index.pug', {
    pageTitle: 'Test Cloud',
    imageUrl: req.body.testCloud || '',
  });
};

export const imageField = async (req: Request, res: Response) => {
  console.log(req.body);
  // const data = {
  //   testCloudimage: JSON.stringify(req.body.testCloudMultiple || []),
  // };

  // await TestCloud.create(data);
  const imageFields = req.body.testCloudMultiple || [];
  res.render('admin/pages/testCloud/index.pug', {
    pageTitle: 'Test Cloud',
    imageUrls: imageFields,
  });
};
