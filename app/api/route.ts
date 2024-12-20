import { vecstore, User } from "../../lib/db";
import { generateTextEmbedding } from "../../lib/model";
import { ApiMetaObject, AuthCredentials } from "../../lib/apitypes";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

const retriever_limit = 5;
const ALLOWED_TIME = 1800; //In seconds
const REFRESH_WINDOW = 300; // 5 mins.
const SECRET_KEY: string =
	process.env.SECRET_KEY || "qtejofhslBadgjvnxAqtejofhslBadgj";

/// TODO(Low Priority): Store information about the user ingesting data in to vector store.
/* interface VectorMetaData {
	chunk_author: string;
} */

function validateMetaObject(t: ApiMetaObject): boolean {
	if (t.credentials)
		return Boolean(t.credentials.email && t.credentials.password);
	else return Boolean(t.token);
}

export async function POST(req: Request) {
	const body = await req.json();

	const query_text: string = body.text;
	const api_method: string = body.method;
	const meta: string = body.meta;
	const meta_object: ApiMetaObject = JSON.parse(meta);

	if (!validateMetaObject(meta_object)) {
		return new Response(
			JSON.stringify({ error: false, message: "Invalid meta object." }),
			{ status: 400, statusText: "Bad Request" },
		);
	}

	meta_object.token = meta_object.token || NULL_TOKEN;

	try {
		const permissions = await validateUserToken(meta_object.token);

		let refreshed_token = undefined;
		if (permissions.auto_refresh)
			// Refresh the token when possible.
			refreshed_token = await refreshToken(meta_object.token);

		switch (api_method) {
			case "ingest":
				if (!permissions.allow_user_calls)
					return new Response(
						JSON.stringify({
							error: true,
							message: "Insufficient permissions.",
						}),
						{ status: 401, statusText: "Denied." },
					);

				// Add text embeddings into the vector store.
				// Here 'meta' is some information about the source of the text being ingested.
				await insertTextIntoStore(
					query_text,
					meta_object.chunk_source || "User uploaded context",
				);
				return new Response(
					JSON.stringify({
						error: false,
						refreshed_token: refreshed_token,
					}),
				);

			case "retrieve":
				if (!permissions.allow_user_calls)
					return new Response(
						JSON.stringify({
							error: true,
							message: "Insufficient permissions.",
						}),
						{ status: 401, statusText: "Denied." },
					);

				// Retrieve documents [array of strings ranked according to similarity score]. Do not return documents that don't belong to the user.
				const relevant_documents = await queryVectorStore(query_text);
				return new Response(
					JSON.stringify({
						error: false,
						documents: relevant_documents,
						refreshed_token: refreshed_token,
					}),
				);

			case "index":
				if (!permissions.allow_index)
					return new Response(
						JSON.stringify({
							error: true,
							message: "Insufficient permissions.",
						}),
						{ status: 401, statusText: "Denied." },
					);

				// Re-create the vector search index on MongoDB.
				// Log user request to re-create vector search index.
				// Here 'meta' is the cause for request to re-create vector search index.
				// Reject is user is 'anon'.
				await createVectorSearchIndex();
				return new Response(JSON.stringify({ error: false }));

			case "createUser":
				if (!permissions.allow_create)
					return new Response(
						JSON.stringify({
							error: true,
							message: "Insufficient permissions.",
						}),
						{ status: 401, statusText: "Denied." },
					);

				// Create a user from the provided credentials.
				// Reject if credentials are missing.
				if (!meta_object.credentials)
					return new Response(
						JSON.stringify({
							error: true,
							message:
								"Invalid user creation request. Missing credientials.",
						}),
						{ status: 400 },
					);
				const new_token = await createUser(meta_object.credentials);
				return new Response(
					JSON.stringify({ error: false, token: new_token }),
				);

			case "authenticateUser":
				/// Authenticate user. Always available.
				/// Reject if credentials are misisng.
				if (!meta_object.credentials)
					return new Response(
						JSON.stringify({
							error: true,
							message:
								"Invalid authentication request. Missing credentials.",
						}),
						{ status: 400 },
					);
				const token = await authenticateUser(meta_object.credentials);
				return new Response(
					JSON.stringify({ error: false, token: token }),
				);

			case "verify":
				/// Verify that the token has user permissions.
				/// Does _nothing_ otherwise.
				/// Otherwise
				if (!permissions.allow_user_calls)
					return new Response(
						JSON.stringify({
							error: true,
							message: "Not a user..",
						}),
						{ status: 449 },
					);
				return new Response(
					JSON.stringify({
						error: false,
						refreshed_token: refreshed_token,
					}),
				);

			case "refresh":
				/// **DEPRECATED**
				/// check if the token has auto_refresh enabled
				/// Return refreshed token.
				if (!permissions.auto_refresh)
					return new Response(
						JSON.stringify({
							error: true,
							message: "Insufficient permissions.",
						}),
						{ status: 401, statusText: "Denied." },
					);
				return new Response(
					JSON.stringify({ error: false, token: refreshed_token }),
					{ status: 200 },
				);

			default:
				return new Response(
					JSON.stringify({
						error: true,
						message: "Invalid API method",
					}),
					{ status: 400 },
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

		return new Response(
			JSON.stringify({ error: true, message: errorMessage }),
			{ status: 500, statusText: "Server error." },
		);
	}
}

/**
 * Retrieve documents from Vector Store.
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
	meta_object?: ApiMetaObject,
) {
	const embeddings = await generateTextEmbedding(text);
	const meta = meta_json ? meta_json : JSON.stringify(meta_object || {});
	await vecstore.add([
		{ vector: embeddings.tolist(), text: text, meta: meta },
	]);
}

/**
 * Create a user with the provided credentials and return an associated token.
 * Throws error if the username (`email`) already exists, or any error occurred in the process of storing credentials and generating token.
 * */
async function createUser(new_credentials: AuthCredentials): Promise<string> {
	// Check if the email already exists in the database
	const existingUser = await User.findOne({ email: new_credentials.email });
	if (existingUser) throw new Error("User already exists!");

	// Hash the password before saving it in the database
	const hashedPassword = await bcrypt.hash(new_credentials.password, 10);

	// Generate a JWT token
	const token = jwt.sign({ email: new_credentials.email }, SECRET_KEY, {
		expiresIn: `${ALLOWED_TIME}s`,
	});

	// Create a new user
	const newUser = new User({
		email: new_credentials.email,
		password: hashedPassword,
		token: token,
	});

	await newUser.save();
	// Store the token in IndexedDB on the client side
	//await storeTokenInIndexedDB(token);   removed and added on the client side

	console.debug("User successfully created and token stored!");
	return token; //return token to indicate success
}

async function authenticateUser(credentials: AuthCredentials): Promise<string> {
	// -------------------DEV-AUTH-STUFF----------------
	if (
		process.env.ALLOW_DEV_AUTH &&
		credentials.email == process.env.DEV_AUTH_UNAME &&
		credentials.password == process.env.DEV_AUTH_PASS
	) {
		const token = jwt.sign({ email: credentials.email }, SECRET_KEY, {
			expiresIn: `10h`,
		});
		return token;
	}
	// ------------------REMOVE-IN-RELEASE---------------

	// Check if the email exists in the database
	const existingUser = await User.findOne({ email: credentials.email });
	if (!existingUser) throw new Error("User does not exist.");

	// Verify the password
	const isPasswordCorrect = await bcrypt.compare(
		credentials.password,
		existingUser.password,
	);

	if (!isPasswordCorrect) throw new Error("Incorrect password.");

	// Generate a JWT token
	const token = jwt.sign({ email: credentials.email }, SECRET_KEY, {
		expiresIn: `${ALLOWED_TIME}s`,
	});

	existingUser.token = token;
	await existingUser.save();
	return token;
}

interface ApiPermissions {
	allow_index: boolean;
	allow_user_calls: boolean;
	allow_create: boolean;
	auto_refresh: boolean;
}

const NULL_TOKEN = "NULL_TOKEN";

const NULL_PERMISSIONS: ApiPermissions = {
	allow_create: true,
	allow_index: false,
	allow_user_calls: false,
	auto_refresh: false,
};

const DEV_PERMISSIONS: ApiPermissions = {
	allow_create: true,
	allow_index: true,
	allow_user_calls: true,
	auto_refresh: false, // Don't refresh this; better to re-login.
};

/**
 * Outlines the server policy of determining if a token is allowed to refresh.
 * Liable to change.
 * */
function refreshPolicy(expiry: number, currentTime: number): boolean {
	if (currentTime > expiry) return false;
	else if (currentTime > expiry - REFRESH_WINDOW) return true;
	else return false;
}

/**
 * Check if the provided token is valid, and return the permissions awarded.
 * It is noteworthy, that expired tokens are not necessarily deemed invalid.
 * */
async function validateUserToken(token: string): Promise<ApiPermissions> {
	if (token == NULL_TOKEN) return NULL_PERMISSIONS;

	const meta_object = jwt.verify(
		token,
		SECRET_KEY,
	) as JwtPayload;

	if (
		process.env.ALLOW_DEV_AUTH &&
		meta_object.email == process.env.DEV_AUTH_UNAME
	) {
		return DEV_PERMISSIONS;
	}

	if (!meta_object || !meta_object.exp)
		throw new Error("Invalid USER token.");

	const existingUser = await User.findOne({ token: token });
	console.debug("token:" + token);
	if (!existingUser) throw new Error("Invalid USER token.");

	const currentTime = Math.floor(Date.now() / 1000);
	const exp = meta_object.exp;

	if (currentTime > exp) throw new Error("Token expired.");

	return {
		allow_create: false,
		allow_index: false,
		allow_user_calls: true,
		auto_refresh: refreshPolicy(exp, currentTime),
	};
}

/**
 * Refresh the token by verifying that a user is associated with it currently.
 * */
async function refreshToken(token: string): Promise<string> {
	const existingUser = await User.findOne({ token: token });
	if (!existingUser) throw new Error("Orphan token; no associated user.");

	const new_token = jwt.sign({ email: existingUser.email }, SECRET_KEY, {
		expiresIn: `${ALLOWED_TIME}s`,
	});

	existingUser.token = new_token;
	await existingUser.save();

	console.debug("Token change:", existingUser, "new:", new_token);
	return new_token;
}
