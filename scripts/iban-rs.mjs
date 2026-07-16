// Serbian IBAN helper — derives an IBAN from a domestic account number and
// validates an existing one (ISO 13616 mod-97). Runs offline; nothing leaves
// this machine. Always cross-check the result against Erste netbanking.
//
//   node scripts/iban-rs.mjs 340-0000012345678-90     -> derive IBAN
//   node scripts/iban-rs.mjs RS35340000001234567890   -> validate IBAN
const arg = (process.argv[2] || "").trim();
if (!arg) {
  console.log(
    "Upotreba:\n" +
      "  node scripts/iban-rs.mjs 340-0000012345678-90    (broj racuna -> IBAN)\n" +
      "  node scripts/iban-rs.mjs RS35340000001234567890  (provera IBAN-a)",
  );
  process.exit(0);
}

/** ISO 13616: move the first 4 chars to the end, letters -> digits, mod 97. */
function mod97(iban) {
  const re = iban.slice(4) + iban.slice(0, 4);
  const num = re
    .split("")
    .map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");
  // Chunked to stay inside Number precision.
  let rem = 0;
  for (let i = 0; i < num.length; i += 7) {
    rem = Number(String(rem) + num.slice(i, i + 7)) % 97;
  }
  return rem;
}

const clean = arg.toUpperCase().replace(/[\s-]/g, "");

if (clean.startsWith("RS")) {
  // Validate mode
  console.log("\nProvera IBAN-a:", clean.replace(/(.{4})/g, "$1 ").trim());
  const okLen = clean.length === 22;
  const okFmt = /^RS\d{20}$/.test(clean);
  const okSum = okFmt && mod97(clean) === 1;
  console.log("  duzina 22      :", okLen ? "OK" : `NE (${clean.length})`);
  console.log("  format RS+20cif:", okFmt ? "OK" : "NE");
  console.log("  mod-97 kontrola:", okSum ? "OK" : "NE — IBAN NIJE ISPRAVAN");
  if (okLen && okFmt && okSum) {
    console.log("\n  banka   :", clean.slice(4, 7), bankName(clean.slice(4, 7)));
    console.log("  racun   :", clean.slice(7, 20));
    console.log("  kontrola:", clean.slice(20, 22));
    console.log("\n  IBAN JE ISPRAVAN");
  }
} else {
  // Derive mode — expects bank(3) + account(13) + control(2) = 18 digits
  const digits = clean.replace(/\D/g, "");
  if (digits.length !== 18) {
    console.error(
      `\nOcekujem 18 cifara (3 banka + 13 racun + 2 kontrola), dobio ${digits.length}.\n` +
        "Primer: 340-0000012345678-90",
    );
    process.exit(1);
  }
  const check = 98 - mod97("RS00" + digits);
  const iban = "RS" + String(check).padStart(2, "0") + digits;
  console.log("\n  banka :", digits.slice(0, 3), bankName(digits.slice(0, 3)));
  console.log("  racun :", digits.slice(3, 16));
  console.log("\n  IBAN  :", iban);
  console.log("  citko :", iban.replace(/(.{4})/g, "$1 ").trim());
  console.log(
    "\n  kontrola mod-97:",
    mod97(iban) === 1 ? "OK" : "GRESKA U RACUNU",
  );
  console.log("\n  Uporedi ovo sa IBAN-om u Erste netbankingu pre nego sto ga posaljes LS-u.");
}

function bankName(code) {
  const banks = {
    340: "(Erste Bank)",
    160: "(Banca Intesa)",
    170: "(UniCredit)",
    265: "(Raiffeisen)",
    275: "(Sberbank/NLB)",
    205: "(NLB Komercijalna)",
    145: "(Eurobank)",
    150: "(Addiko)",
  };
  return banks[code] || "";
}
