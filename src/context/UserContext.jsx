import { createContext } from "react";

// create the context
const UserContext = createContext();

export const UserProvider = UserContext.Provider;
export const UserConsumer = UserContext.Consumer;

export default UserContext;