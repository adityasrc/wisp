import * as z from "zod";

export const signupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name cannot exceed 50 characters").trim(),
    username: z.string().min(4, "Username must be at least of 4 characters").max(20, "Username cannot exceed 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores").toLowerCase().trim(),
    password: z.string().min(8, "Password must of at least of 8 characters").max(64, "Password cannot exceed 64 characters")
});

export const loginSchema = z.object({
    username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/).toLowerCase().trim(),
    password: z.string().min(8).max(64)
});

export const updateUsernameSchema = signupSchema.pick({ username: true });

export type SignupSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type UpdateUsernameSchema = z.infer<typeof updateUsernameSchema>;
