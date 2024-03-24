import { INewPost, INewUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

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
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

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
      appwriteConfig.userCollectionId
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

export async function createPost(post: INewPost) {
  try {
    //upload image to storage
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;
    //get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    console.log(fileUrl);

    if (!fileUrl) {
      deleteFile(uploadedFile.$id);
      throw Error;
    }
    //convert tags in an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];
    console.log(tags);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );
    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }
    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000
    );
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// export async function getRecentPosts() {
//   const posts = await databases.listDocuments(
//     appwriteConfig.databaseId,
//     appwriteConfig.postCollectionId,
//     [Query.orderDesc('$createdAt'),Query.limit(20)]
//   )
//   console.log(posts);

//   if(!posts) throw Error;
//   return posts;

// }

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId
      // [Query.select([])]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(postId: string, userId:string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post:postId,
      }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId:string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId,
    );
    if (!statusCode) throw Error;
    return {status:'ok'};
  } catch (error) {
    console.log(error);
  }
}
