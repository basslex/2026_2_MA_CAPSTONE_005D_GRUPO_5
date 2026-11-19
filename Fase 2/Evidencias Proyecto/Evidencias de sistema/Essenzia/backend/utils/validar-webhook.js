
/* =====================================================
   ESSENZIA - VALIDACIÓN DE WEBHOOKS
   Archivo: backend/utils/validar-webhook.js
===================================================== */

const {
    createHmac,
    timingSafeEqual
} = require("node:crypto");

function validarWebhookMercadoPago(req) {
    const secreto = process.env.MP_WEBHOOK_SECRET;

    if (!secreto) {
        throw new Error(
            "MP_WEBHOOK_SECRET no está configurado."
        );
    }

    const firma = req.get("x-signature");
    const requestId = req.get("x-request-id");

    const dataId = req.query["data.id"];

    if (
        typeof firma !== "string" ||
        typeof requestId !== "string" ||
        typeof dataId !== "string" ||
        !dataId ||
        !requestId
    ) {
        return false;
    }

    const partes = Object.fromEntries(
        firma.split(",").map(parte => {
            const indice = parte.indexOf("=");

            return [
                parte.slice(0, indice).trim(),
                parte.slice(indice + 1).trim()
            ];
        })
    );

    const ts = partes.ts;
    const v1 = partes.v1;

    console.log("=== DIAGNÓSTICO DE FIRMA ===");

console.log(
    "Timestamp presente:",
    Boolean(ts)
);

console.log(
    "Timestamp válido:",
    /^\d{10,16}$/.test(ts || "")
);

console.log(
    "Firma v1 presente:",
    Boolean(v1)
);

console.log(
    "Formato de firma válido:",
    /^[a-f0-9]{64}$/i.test(v1 || "")
);

console.log(
    "Data ID utilizado:",
    dataId
);

console.log(
    "Longitud del secreto:",
    secreto.length
);

console.log("============================");

    if (
        !/^\d{10,16}$/.test(ts || "") ||
        !/^[a-f0-9]{64}$/i.test(v1 || "")
    ) {
        return false;
    }

    const manifest =
    `id:${dataId};` +
    `request-id:${requestId};` +
    `ts:${ts};`;

    const firmaEsperada = createHmac(
        "sha256",
        secreto
    )
        .update(manifest)
        .digest();

        const manifestOriginal =
    `id:${dataId};` +
    `request-id:${requestId};` +
    `ts:${ts};`;

const firmaOriginal = createHmac(
    "sha256",
    secreto
)
    .update(manifestOriginal)
    .digest();

const firmaRecibidaPrueba = Buffer.from(
    v1,
    "hex"
);

console.log("=== COMPARACIÓN DE FIRMAS ===");

console.log(
    "Coincide usando minúsculas:",
    firmaRecibidaPrueba.length === firmaEsperada.length &&
    timingSafeEqual(
        firmaRecibidaPrueba,
        firmaEsperada
    )
);

console.log(
    "Coincide usando ID original:",
    firmaRecibidaPrueba.length === firmaOriginal.length &&
    timingSafeEqual(
        firmaRecibidaPrueba,
        firmaOriginal
    )
);

console.log("=============================");

    const firmaRecibida = Buffer.from(
        v1,
        "hex"
    );

    return (
        firmaRecibida.length === firmaEsperada.length &&
        timingSafeEqual(
            firmaRecibida,
            firmaEsperada
        )
    );
}

module.exports = {
    validarWebhookMercadoPago
};
