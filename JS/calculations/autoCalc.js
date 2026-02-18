// existing logic and meta handling

if (chk("chkSilikon")) {
    result.silikon = 2 * (d + s);
    if (chk("chkZidovi")) {
        result.silikon += 4 * h;
    }
    for (const o of openings) {
        if (o.kind === "window" || o.kind === "geberit" || o.kind === "niche") {
            result.silikon += 2 * (o.w + o.h) * o.count;
        } else if (o.kind === "vert") {
            result.silikon += o.h * o.count;
        }
    }
}

// existing logic and meta handling