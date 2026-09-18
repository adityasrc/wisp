import { Router } from "express";
import bcrypt from "bcrypt";
import { type User, prisma } from "@repo/db";
import { loginSchema, signupSchema } from "@repo/common";
const router: Router = Router();



async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

async function userExist(username: string): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        return !!user;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getUser(username: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function createUser(name: string, username: string, password: string): Promise<User | null> {
    try {
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name: name,
                username: username,
                password: hashedPassword
            }
        });
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}


router.post("/register", async (req, res) => {
    const parsedData = signupSchema.safeParse(req.body);

    if (!parsedData.success) {
        const message = parsedData.error.issues[0]?.message || "Invalid Inputs";
        return res.status(400).json({ message });
    }

    const { name, username, password } = parsedData.data;

    if (await userExist(username)) {
        const message = "User already exists";
        return res.status(409).json({ message });
    }

    if (await createUser(name, username, password)) {
        const message = "User created successfully ";
        return res.status(201).json({ message });
    } else {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    const parsedData = loginSchema.safeParse(req.body);

    if (!parsedData.success) {
        const message = parsedData.error.issues[0]?.message;
        return res.status(400).json({ message });
    }

    const { username, password } = parsedData.data;

    const user = await getUser(username);
    if (!user) {
        const message = "Invalid username or password";
        return res.status(401).json({ message });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const message = "Invalid username or password";
        return res.status(401).json({ message });
    }

    return res.status(200).json({
        message: "Logged in successfully",
        user: {
            id: user.id,
            name: user.name,
            username: user.username
        }
    });
});


router.post("/logout", (req, res) => {

})

export default router;