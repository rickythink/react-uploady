const DEFAULT_URL = "http://test.upload/url",
DEFAULT_METHOD = "POST";

export const RESPONSE_DEFAULTS = {
    statusCode: 200,
    body: { success: true },
};

const createResponse = (options = {}) => ({
    ...RESPONSE_DEFAULTS,
    ...options,
});

export const interceptWithHandler = (handler, alias = "uploadReq", url = DEFAULT_URL, method = DEFAULT_METHOD) =>
    intercept(url, method, handler, alias);

export const interceptWithDelay = (delay = 100, alias = "uploadReq", url = DEFAULT_URL, method = DEFAULT_METHOD) =>
    interceptWithHandler((req) => {
        req.reply({
            ...RESPONSE_DEFAULTS,
            delay,
        });
    }, alias, url, method);

const intercept = (url = DEFAULT_URL, method = DEFAULT_METHOD, resOptions, alias = "uploadReq") => {
    const handler = (typeof resOptions === "function")  ? resOptions : createResponse(resOptions)

    cy.intercept(method, url, handler)
        .as(alias);
};

export default intercept;
