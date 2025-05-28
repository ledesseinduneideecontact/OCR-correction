import { Router } from 'express';
import multer from 'multer';
import { authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { processCorrection } from '../services/correction';
import config from '../config';
import { logger } from '../lib/logger';

const router = Router();

const upload = multer({
  limits: {
    fileSize: config.uploadLimits.fileSize,
    files: config.uploadLimits.files
  }
});

router.post(
  '/process',
  authenticateUser,
  upload.array('files'),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { correctionId, gradingCriteria } = req.body;

      if (!files?.length) {
        throw new AppError(400, 'No files uploaded');
      }

      if (!correctionId) {
        throw new AppError(400, 'Missing correctionId');
      }

      logger.info(`Processing correction ${correctionId} with ${files.length} files`);

      await processCorrection({
        files,
        correctionId,
        gradingCriteria,
        userId: req.user.id
      });

      res.json({
        message: 'Processing started',
        filesCount: files.length
      });
    } catch (error) {
      next(error);
    }
  }
);

export default upload