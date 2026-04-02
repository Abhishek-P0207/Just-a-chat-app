export declare function checkUsernameIsUnique(name: string): Promise<boolean>;
export declare function checkUserExistsById(id: string): Promise<{
    id: string;
    name: string;
    email: string | null;
    hash: string;
    createdAt: Date;
} | null>;
//# sourceMappingURL=userStuff.d.ts.map