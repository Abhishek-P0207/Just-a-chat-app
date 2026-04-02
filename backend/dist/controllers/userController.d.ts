export declare function registerUser(name: string, password: string): Promise<{
    id: string;
    name: string;
    email: string | null;
    hash: string;
    createdAt: Date;
}>;
export declare function getAllUsers(): Promise<{
    id: string;
    name: string;
    createdAt: Date;
}[]>;
export declare function checkUser(name: string, password: string): Promise<{
    id: string;
    name: string;
} | undefined>;
//# sourceMappingURL=userController.d.ts.map