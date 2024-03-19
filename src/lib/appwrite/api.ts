import { INewUser } from "@/types";
import {  ID } from "appwrite";
import { account, appwriteConfig, avatars, databases } from "./config";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );
    // return newAccount;
    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      username: user.username,
      email: newAccount.email,
      imageUrl: avatarUrl,
    });
    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}
export async function saveUserToDB(user: {
  accountId: string;
  name: string;
  username?: string;
  email: string;
  imageUrl: URL;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function signInAccount(user: { email: string; password: string }) {
    try {
      const session = await account.createEmailPasswordSession(user.email, user.password);
  
      return session;
    } catch (error) {
      console.log(error);
    }
  }
  export async function getAccount() {
    try {
      const currentAccount = await account.get();
    //   console.log(currentAccount);
      
  
      return currentAccount;
    } catch (error) {
      console.log(error);
    }
  }
  export async function getCurrentUser() {
    try {
    const currentAccount = await getAccount();
    // console.log(currentAccount);

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        // [Query.equal("name", currentAccount.name)],
    );
    console.log(currentUser.documents[0]);

    if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  export async function signOutAccount() {
    try {
      const signOut = await account.deleteSession("current");
      return signOut;
    } catch (error) {
      console.log(error);
    }
  }