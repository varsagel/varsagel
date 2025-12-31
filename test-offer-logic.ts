
async function main() {
  const listingId = "cmj1ymu8a000nfqoyit59s4iv";
  const sellerId = "cmj1xug7j0006gthfjad0m8us";
  const url = "http://localhost:3000/api/teklif-ver";

  console.log("Simulating offer submission...");
  console.log("Listing:", listingId);
  console.log("Seller:", sellerId);

  const payload = {
    listingId,
    price: "100",
    message: "Bu bir test teklifidir. Lütfen dikkate almayınız. En az 20 karakter olmalı.",
    images: ["https://example.com/image.jpg"],
    attributes: {
      "some-attribute": "some-value"
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-auth": "true",
        "x-debug-user-id": sellerId
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);

  } catch (e) {
    console.error("Error:", e);
  }
}

main();
