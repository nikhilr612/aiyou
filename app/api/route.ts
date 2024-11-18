import { vecstore, User } from "../../lib/db";
import { generateTextEmbedding } from "../../lib/model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const retriever_limit = 5;

export async function POST(req: Request) {
  const body = await req.json();

  const query_text: string = body.text;
  const api_method: string = body.method;
  const meta: string = body.meta;
  const email: string = body.email;
  const password: string = body.password;
  const token: string = body.token;

  try {
    switch (api_method) {
      case "ingest":
        // Add text embeddings into the vector store.
        // Here 'meta' is some information about the source of the text being ingested.
        await insertTextIntoStore(query_text, meta);
        return new Response(JSON.stringify({ error: false }));

      case "retrieve":
        // Retrieve documents [array of strings ranked according to similarity score]. Do not return documents that don't belong to the user.
        const relevant_documents = await queryVectorStore(query_text);
        return new Response(
          JSON.stringify({ error: false, documents: relevant_documents }),
        );

      case "index":
        // Re-create the vector search index on MongoDB.
        // Log user request to re-create vector search index.
        // Here 'meta' is the cause for request to re-create vector search index.
        // Reject is user is 'anon'.
        await createVectorSearchIndex();
        return new Response(JSON.stringify({ error: false }));
      case "checkUser":
        try {
          if (!meta || !email || !password) {
            return new Response(
              JSON.stringify({
                error: true,
                message: "Missing required fields (meta, email, or password)",
              }),
              { status: 400 },
            );
          }

          // Check if the user exists or validate user data using checkUser function
          const back_res = await checkUser(meta, email, password);

          if (back_res == "exists") {
            // If the function returns an error message, respond with it
            return new Response(
              JSON.stringify({ error: true, message: "User already exists!" }),
              { status: 400 },
            );
          }
          if (back_res == "error") {
            // If the function returns an error message, respond with it
            return new Response(
              JSON.stringify({
                error: true,
                message: "Error with user creation",
              }),
              { status: 402 },
            );
          }
          // If no issues, return a successful response
          return new Response(
            JSON.stringify({
              error: false,
              message: "User validated or processed successfully",
              token: back_res,
            }),
            { status: 200 },
          );
        } catch (err) {
          console.error("Error in checkUser:", err);
          return new Response(
            JSON.stringify({
              error: true,
              message: "Internal server error during user check",
            }),
            { status: 505 },
          );
        }
      case "authenticateUser":
        try {
          if (!email || !password) {
            return new Response(
              JSON.stringify({
                error: true,
                message: "Missing required fields (email or password)",
              }),
              { status: 400 },
            );
          }

          console.debug("Email:", email, "Password:", password);

          // Call the authenticateUser function
          const back_res = await authenticateUser(email, password);

          if (back_res.error) {
            // If the function returns an error message, respond with it
            return new Response(
              JSON.stringify({ error: true, message: back_res.error }),
              { status: 400 },
            );
          }

          // If no issues, return the token in the successful response
          return new Response(
            JSON.stringify({
              error: false,
              message: "User authenticated successfully",
              token: back_res.token,
            }),
            { status: 200 },
          );
        } catch (err) {
          console.error("Error in authenticateUser:", err);
          return new Response(
            JSON.stringify({
              error: true,
              message: "Internal server error during user authentication",
            }),
            { status: 505 },
          );
        }
      case "validateUser":
        try {
          if (!token) {
            return new Response(
              JSON.stringify({
                error: true,
                message: "Missing required fields (email or password)",
              }),
              { status: 400 },
            );
          }

          console.debug("Password:", token);

          // Call the authenticateUser function
          const back_res = await validateUserToken(token);

          if (back_res.error) {
            return new Response(
              JSON.stringify({ error: true, message: back_res.error }),
              { status: 402 },
            );
          }

          // If no issues, return the token in the successful response
          return new Response(
            JSON.stringify({
              error: false,
              message: "User authenticated successfully",
            }),
            { status: 200 },
          );
        } catch (err) {
          console.error("Error in authenticateUser:", err);
          return new Response(
            JSON.stringify({
              error: true,
              message: "Internal server error during user authentication",
            }),
            { status: 500 },
          );
        }

      default:
        return new Response(
          JSON.stringify({ error: true, message: "Invalid API method" }),
          { status: 500 },
        );
    }
  } catch (error) {
    let errorMessage: string;

    // Just JS things.
    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = String(error);

    // Log this for us too..
    console.debug(
      `An error occurred while handling method '${api_method}'.\n${errorMessage}\nERR: ${error}\n`,
    );

    return new Response(JSON.stringify({ error: true, message: errorMessage }));
  }
}

/**
 * Retrieve documents from
 * */
async function queryVectorStore(query_text: string): Promise<string[]> {
  const embeddings = await generateTextEmbedding(query_text);
  const documents = await vecstore
    .search(embeddings.tolist())
    .limit(retriever_limit)
    .toArray();

  return documents.map((d) => {
    const meta = JSON.parse(d.meta);
    const source: string = meta.source;
    return `${d.text}\n\t- ${source}`;
  });
}

async function createVectorSearchIndex() {
  await vecstore.createIndex("vector", {
    replace: true,
  });
}

/**
 * Insert `text` into vector store with additional information (like `source`) in `meta`.
 * */
async function insertTextIntoStore(
  text: string,
  meta_json?: string,
  meta_object?: { [key: string]: any },
) {
  const embeddings = await generateTextEmbedding(text);
  const meta = meta_json ? meta_json : JSON.stringify(meta_object || {});
  await vecstore.add([{ vector: embeddings.tolist(), text: text, meta: meta }]);
}

const SECRET_KEY = process.env.SECRET_KEY;

async function checkUser(
  meta_object: Record<string, any> = {},
  email: string,
  password: string,
): Promise<string | null> {
  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return "exists";
    }

    // Hash the password before saving it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a JWT token
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    // Create a new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
      token: token,
      meta: meta_object, // Optionally store additional metadata
    });

    await newUser.save();
    // Store the token in IndexedDB on the client side
    //await storeTokenInIndexedDB(token);   removed and added on the client side

    console.debug("User successfully created and token stored!");
    return token; //return token to indicate success
  } catch (err) {
    console.error("Error during user creation:", err);
    return "error";
  }
}

/// *** DEV AUTH ESCAPE HATCH. DO NOT COMMIT ***
let DEV_AUTH_TOKEN = "";
/// --------------------------------------------

interface AuthResponse {
  token: string | null;
  error: string | null;
}

async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  /// TODO: REMOVE THIS
  console.debug(process.env);
  if (
    process.env.ALLOW_DEV_AUTH &&
    email == process.env.DEV_AUTH_UNAME &&
    password == process.env.DEV_AUTH_PASS
  ) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "10h" });
    DEV_AUTH_TOKEN = token;
    return { token: DEV_AUTH_TOKEN, error: null };
  }
  /// ----

  try {
    // Check if the email exists in the database
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return { token: null, error: "User does not exist." };
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      return { token: null, error: "Invalid password." };
    }

    // Generate a JWT token
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    existingUser.token = token;
    await existingUser.save();
    return { token, error: null };
  } catch (err) {
    console.error("Error during user authentication:", err);
    return {
      token: null,
      error: "An error occurred during authentication. Please try again." + err,
    };
  }
}

async function validateUserToken(
  token: string,
): Promise<{ valid: boolean; error: string | null }> {
  try {
    const existingUser = await User.findOne({ token: token });
    if (!existingUser) {
      return { valid: false, error: "Invalid token." };
    }
    jwt.decode(token);
    return { valid: true, error: null };
  } catch (err) {
    // Handle any errors that occur during the database query
    console.error("Error during token validation:", err);
    return {
      valid: false,
      error: "Internal server error during token validation.",
    };
  }
}
