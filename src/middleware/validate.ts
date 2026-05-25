import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as any;
        res.status(400).json({
          error: 'Validation failed',
          details: zodError.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
        });
      } else {
        res.status(400).json({ error: 'Invalid input' });
      }
    }
  };
};
