/**
 * Module to deal with client-side token-related shenanigans.
 * */

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { apiCall } from "./apicall";

/**
 * Retrieve stored token from IndexDB and verify via ApiCall. Redirect user to login page if necessary.
 * */
export async function storedTokenValidation(
  toast: (a: {
    title: string;
    description: string;
    variant: "destructive" | "default" | null | undefined;
  }) => { id: string },
  router: AppRouterInstance,
): Promise<string | undefined> {
  //shows login toast
  try {
    // Step 1: Retrieve token from IndexedDB
    const token = await getTokenFromIndexedDB();
    console.debug("Retrieved token:", token);
    if (!token) {
      toast({
        title: "Error",
        description: "No token found. Please log in again.",
        variant: "destructive",
      });
      router.push("/fcku");
      return undefined;
    }

    const result = await apiCall("verify", { token: token });

    // TODO: CHECK LOGIC HERE....

    if (!result.error) {
      return token;
    } else if (result.message === "jwt expired") {
      toast({
        title: "Token expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      router.push("/login");
    } else {
      toast({
        title: "Error",
        description: result.message || "An error occurred.",
        variant: "destructive",
      });
      router.push("/fcku");
    }
  } catch (err) {
    console.error("Error during token validation:", err);
    toast({
      title: "Error",
      description: "An error occurred during the validation process.",
      variant: "destructive",
    });
    router.push("/fcku");
  }
}

export function getTokenFromIndexedDB(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UserDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["tokens"], "readonly");
      const store = transaction.objectStore("tokens");

      const tokenRequest = store.get("authToken");
      
      tokenRequest.onsuccess = () => {
        resolve(tokenRequest.result ? (tokenRequest.result as { token: string }).token : null);
      };

      tokenRequest.onerror = () => {
        reject("Error retrieving token from IndexedDB");
      };
    };

    request.onerror = () => {
      reject("Error opening IndexedDB");
    };
  });
}

/**
 * Function to store user token in IndexedDB.
 * */
export async function storeTokenInIndexedDB(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UserDB", 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("tokens", "readwrite");
      const store = transaction.objectStore("tokens");

      // Check if a token already exists
      const getRequest = store.get("authToken");

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          console.debug("Token already exists. Replacing with new token.");
        } else {
          console.debug("No token found. Storing new token.");
        }

        // Replace or insert the token
        store.put({ id: "authToken", token });

        transaction.oncomplete = () => {
          console.debug("Token stored successfully in IndexedDB");
          resolve();
        };

        transaction.onerror = () => {
          console.error("Error storing token in IndexedDB");
          reject(transaction.error);
        };
      };

      getRequest.onerror = () => {
        console.error("Error checking existing token in IndexedDB");
        reject(getRequest.error);
      };
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
      reject(request.error);
    };
  });
}