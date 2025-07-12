import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import "react-native-url-polyfill/auto";

export const appwriteConfig = {
  endpoint:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  platform: "com.oguzyucel.foodorderingapp",
  projectId:
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "your_project_id_here",
  databaseId:
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "your_database_id_here",
  bucketId: "68723021001e2b06c714",
  userCollectionId: "686ec716003002ac6bd1",
  categoriesCollectionId: "68722b9c000430ed0e27",
  menuCollectionId: "68722c2b002a15817cab",
  CustomizationsCollectionId: "68722d380032af61f2eb",
  MenuCustomizationsCollectionId: "68722de7000e9d8d0087",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);

export const database = new Databases(client);

export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl,
      }
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    if (!session) throw Error;

    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries
    );
    return menus.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCategories = async () => {
  try {
    const Categories = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    );
    return Categories.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

// Appwrite'dan tek bir menü öğesi getir
export const getMenuItem = async (id: string) => {
  try {
    const response = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      id
    );
    return response;
  } catch (error) {
    console.error("Appwrite service :: getMenuItem :: error", error);
    return null;
  }
};

export const getCustomizations = async () => {
  try {
    const response = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.CustomizationsCollectionId // Bu koleksiyonu oluşturmanız gerekecek
    );
    return response.documents;
  } catch (error) {
    console.error("Appwrite service :: getCustomizations :: error", error);
    return [];
  }
};
