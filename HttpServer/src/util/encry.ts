import md5 from "blueimp-md5";

export function getToken(openId: string, salt: number): string {
    return md5(md5(openId + salt) + salt + openId[0]);
};

export function getArrayIntByDBVachar(arrStr: string): number[] {
    if (!arrStr) {
        return [];
    }
    const arr = arrStr.split(';');
    const intArr: number[] = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        intArr.push(parseInt(arr[i]));
    }
    return intArr;
};

export function getVacharByArrayInt(arr: Array<string | number>): string {
    const vc = arr.join(";");
    return vc;
};
