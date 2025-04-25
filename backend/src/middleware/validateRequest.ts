import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            console.error("Zod Validation Error:", JSON.stringify(formattedErrors, null, 2));

            res.status(400).json({
                message: 'Input validation failed',
                errors: formattedErrors,
            });
        } else {
            console.error("Unexpected error during validation:", error);
            next(error);
        }
    }
};