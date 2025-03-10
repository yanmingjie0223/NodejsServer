export async function authLogin(req, res): Promise<any | null> {
    const data = await getData(req, res);
    if (!data) {
        return null;
    }

    const openId = data.openId;
    const hope = data.token;

    const redis = req.redis;
    const token = await redis.get(`user-${openId}-hope`);

    if (token !== hope) {
        res.end(JSON.stringify({ code: -1, errMsg: 'token auth failed' }));
        return null;
    }

    return data;
};

export async function getData(req, res): Promise<any | null> {
    const kvBody = req.body;
    try {
        const data = JSON.parse(kvBody.data);
        return data;
    } catch (error) {
        res.end(JSON.stringify({ code: -1, errMsg: 'upload data is not json data' }));
        return null;
    }
};