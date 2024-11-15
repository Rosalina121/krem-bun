/*
    Following is just a typed version of ravarcheon's code:
    https://bsky.app/profile/ravarcheon.com/post/3lav6cp7njk2d
    All credit to her
*/

export function lerpStrings(s1: string, s2: string, t: number) {

    if (t >= 1) { return s2 }

    const a1 = s1.split("").map(c => c.charCodeAt(0));
    const a2 = s2.split("").map(c => c.charCodeAt(0));
    const l1 = a1.length, l2 = a2.length;
    const newL = Math.round(l1 + (l2 - l1) * t);

    if (newL <= 0) return "";

    function resize(a: number[], oldL: number, newL: number) { // bilinear interpolation
        if (oldL === 0) return new Array(newL).fill(0);
        if (oldL === 1 || newL === 1) return new Array(newL).fill(a[0]);

        const r = new Array(newL);
        const scale = (oldL - 1) / (newL - 1);

        for (let i = 0; i < newL; i++) {
            const idx = scale * i;
            const lower = Math.floor(idx), upper = Math.min(Math.ceil(idx), oldL - 1);
            const weight = idx - lower;

            r[i] = Math.round(a[lower] * (1 - weight) + a[upper] * weight);
        }

        return r;
    }

    const r1 = resize(a1, l1, newL);
    const r2 = resize(a2, l2, newL);

    const res = new Array(newL);
    for (let i = 0; i < newL; i++) { // lerp per char in the string
        const c = Math.round(r1[i] * (1 - t) + r2[i] * t);
        res[i] = String.fromCharCode(c);
    }

    return res.join("");
}
