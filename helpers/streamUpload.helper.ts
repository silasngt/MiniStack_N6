import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Đặt cấu hình ở đầu file
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME?.trim(),
  api_key: process.env.CLOUD_KEY?.trim(),
  api_secret: process.env.CLOUD_SECRET?.trim()
});

export const streamUpload = (buffer: any) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
