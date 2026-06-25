declare const decodeJWT: (token: string) => any;
declare const isAccessTokenExpired: (token: string) => boolean;
declare const refreshAccessToken: () => Promise<void>;
declare const authFetch: (url: string, options?: RequestInit) => Promise<Response>;
//# sourceMappingURL=common.d.ts.map