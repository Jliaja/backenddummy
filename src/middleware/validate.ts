import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });

        return;
      }

      console.error(error);

      res.status(400).json({
        error: 'Invalid input',
      });
    }
  };
};