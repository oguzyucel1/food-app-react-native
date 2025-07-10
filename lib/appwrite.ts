import { CreateUserParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  platform : "com.oguzyucel.foodorderingapp",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  uesrCollectionId: "686ec716003002ac6bd1"
}

export const client = new Client();

client.setEndpoint(appwriteConfig.endpoint!)
.setProject(appwriteConfig.projectId!)
.setPlatform(appwriteConfig.platform)


export const account = new Account(client);

export const database = new Databases(client);

const avatars = new Avatars(client);

export const createUser = async ({email,password,name} : CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if(!newAccount) throw Error;
            
    await signIn({email, password})

    const avatarUrl = avatars.getInitialsURL(name);

   return await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.uesrCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl
      }) ;

     
  }
  catch (e) {
    throw new Error(e as string);
  }
}

export const signIn = async ({email, password} : SignInParams) => {
  try{
    const session = await account.createEmailPasswordSession(email, password);

    if(!session) throw Error;

    return session;
  } catch (e) {
    throw new Error(e as string);
  }
}

export const getCurrentUser = async () => {
  try {
     const currentAccount = await account.get();
     if(!currentAccount) throw Error;

     const currentUser = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.uesrCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
     )

     if(!currentUser) throw Error;
     return currentUser.documents[0];
  } catch (e) {
    throw new Error(e as string);
  }
}
