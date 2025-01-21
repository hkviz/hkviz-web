import { z } from 'zod';

export const zodParseDate = z.string().transform((arg) => new Date(arg));
