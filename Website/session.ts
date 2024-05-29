
import { MONGO_URI} from "./database";
import session, { MemoryStore } from "express-session";
import { User, FlashMessage } from "./interfaces/types";
import mongoDbSession from "connect-mongodb-session";
const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: MONGO_URI,
    collection: "sessions",
    databaseName: "LOTR",
});

declare module 'express-session' {
    export interface SessionData {
        user?: User,
        message?: FlashMessage;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});
