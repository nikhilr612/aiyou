// API types; common

export interface AuthCredentials {
	email: string;
	password: string;
}

export interface ApiMetaObject {
	credentials?: AuthCredentials;
	token?: string;
	chunk_source?: string;
}
