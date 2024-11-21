// API-stuff client-side.

import { ApiMetaObject } from "./apitypes";
import { storeTokenInIndexedDB } from "./tokenutils";

/**
 * Convenience function to make an API call with the specified API `method` and `meta` object.
 * */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function apiCall(
  method: string,
  meta: ApiMetaObject,
  params?: { text: string },
): Promise<any> {
  // TODO: change the return type
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meta: JSON.stringify({
        credentials: meta.credentials,
        token: meta.token,
        chunk_source: meta.chunk_source,
      }),
      method: method,
      ...params,
    }),
  });
  const result = await response.json();
  if (result.refreshed_token)
    await storeTokenInIndexedDB(result.refreshed_token);
  return result;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
