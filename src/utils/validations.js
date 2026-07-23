import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

const emailRule = z.string().min(1, 'Email is required').email('Invalid email address format');
const passwordRule = z.string().min(6, 'Password must be at least 6 characters');
const safeString = () => z.string().trim().regex(/^[^<>]*$/, "Special characters are not allowed");
const textRequired = (msg) => safeString().min(1, msg);
const descString = () => z.string().regex(/^[a-zA-Z0-9 ]*$/, "Description must only contain letters, numbers, and spaces");

export const authSchemas = {
    login: toTypedSchema(z.object({
        email: emailRule,
        password: passwordRule
    })),
    otp: toTypedSchema(z.object({
        otpCode: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must only contain numbers')
    })),
    forgotPassword: toTypedSchema(z.object({
        email: emailRule
    })),
    changePassword: toTypedSchema(z.object({
        password: passwordRule,
        confirmPassword: passwordRule
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }))
};

export const reportSchemas = {
    create: toTypedSchema(z.object({
        title: textRequired('Report title is required')
            .min(5, 'Title must be at least 5 characters')
            .max(50, 'Title cannot exceed 50 characters'),
        description: textRequired('Description is required')
            .max(256, 'Description cannot exceed 256 characters'),
        categoryId: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a valid category'
        }),
        images: z.array(z.any()).optional()
    })),
    category: toTypedSchema(z.object({
        name: textRequired('Category name is required').max(30, 'Category name cannot exceed 30 characters'),
        description: safeString().max(256, 'Description cannot exceed 256 characters').optional()
    }))
};

export const userSchemas = {
    create: toTypedSchema(z.object({
        email: emailRule,
        roleId: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a valid role'
        }),
        kut_id: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a Kudi'
        })
    })),
    createAuto: toTypedSchema(z.object({
        firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(30, 'First name cannot exceed 30 characters').regex(/^[a-zA-Z\s]*$/, 'First name must contain only letters'),
        lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(30, 'Last name cannot exceed 30 characters').regex(/^[a-zA-Z\s]*$/, 'Last name must contain only letters'),
        roleId: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a valid role'
        }),
        kut_id: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a Kudi'
        })
    }))
};

export const roomSchemas = {
    room: toTypedSchema(z.object({
        name: textRequired('Room name is required'),
        code: textRequired('Room code is required'),
        building: z.string().optional(),
        floor: z.any().optional(),
        capacity: z.any().refine(val => val !== null && val !== '', {
            message: 'Capacity is required'
        }),
        type: textRequired('Room type is required'),
        description: descString().optional(),
        facilities: z.string().optional()
    })),
    session: toTypedSchema(z.object({
        roomId: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a room'
        }),
        date: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Date is required'
        }),
        session: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Session is required'
        }),
        status: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Status is required'
        }),
        note: z.string().optional()
    })),
    schedule: toTypedSchema(z.object({
        teacherId: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Please select a monk'
        }),
        dates: z.array(z.string()).optional(),
        startTime: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Start time is required'
        }),
        endTime: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'End time is required'
        }),
        note: z.string().optional()
    }).superRefine((data, ctx) => {
        const { startTime, endTime } = data;
        if (!startTime || !endTime) return;

        const toMinutes = (timeStr) => {
            if (typeof timeStr !== 'string') return null;
            const parts = timeStr.split(':');
            if (parts.length < 2) return null;
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            if (isNaN(hours) || isNaN(minutes)) return null;
            return hours * 60 + minutes;
        };

        const startMin = toMinutes(startTime);
        const endMin = toMinutes(endTime);

        if (startMin === null || endMin === null) return;

        if (startMin >= endMin) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'End time must be after start time',
                path: ['endTime']
            });
            return;
        }

        let minAllowed, maxAllowed, sessionLabel;
        if (session === 'MORNING') {
            minAllowed = 7 * 60; // 07:00
            maxAllowed = 12 * 60; // 12:00
            sessionLabel = 'Morning (07:00 - 12:00)';
        } else if (session === 'AFTERNOON') {
            minAllowed = 13 * 60; // 13:00
            maxAllowed = 17 * 60; // 17:00
            sessionLabel = 'Afternoon (13:00 - 17:00)';
        } else if (session === 'EVENING') {
            minAllowed = 17.5 * 60; // 17:30
            maxAllowed = 20.5 * 60; // 20:30
            sessionLabel = 'Evening (17:30 - 20:30)';
        }

        if (minAllowed !== undefined && maxAllowed !== undefined) {
            if (startMin < minAllowed || startMin > maxAllowed) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Start time must be within ${sessionLabel}`,
                    path: ['startTime']
                });
            }
            if (endMin < minAllowed || endMin > maxAllowed) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `End time must be within ${sessionLabel}`,
                    path: ['endTime']
                });
            }
        }
    }))
};

export const profileSchemas = {
    update: toTypedSchema(z.object({
        name: textRequired('Name is required').min(3, 'Name must be at least 3 characters'),
        bio: safeString().optional(),
        gender: z.string().optional(),
        dateOfBirth: z.any().optional(),
        phone: z.string().regex(/^[0-9]*$/, 'Phone must only contain numbers').max(15, 'Phone number must be at most 15 digits').optional()
    }))
};

export const surveySchemas = {
    target: toTypedSchema(z.object({
        name: z.string().trim().regex(/^[^<>]*$/, "Special characters are not allowed").min(1, 'Target name is required').max(50, 'Target name cannot exceed 50 characters')
    }))
};

export const eventSchemas = {
    create: toTypedSchema(z.object({
        name: textRequired('Event name is required').min(3, 'Event name must be at least 3 characters').max(100, 'Event name cannot exceed 100 characters'),
        eventDate: z.any().refine(val => val !== '' && val !== null && val !== undefined, {
            message: 'Event date is required'
        })
    }))
};
