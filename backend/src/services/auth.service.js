import PrismaClient from '@prisma/client'

const prisma = new PrismaClient();

export const findUserByUsername = async (username) => {
    return await prisma.user.findUserByUsername({
        where: { username },
    });
};

export const createUser = async (username, name, hashedPassword) => {
    return await prisma.user.create({
            data: {
                username,
                name,
                password: hashedPassword,
            },
    });
};