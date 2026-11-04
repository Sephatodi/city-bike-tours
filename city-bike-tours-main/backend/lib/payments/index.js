const manualProvider = {
  id: "manual",
  async record({ method, amount, reference }) {
    return { provider: "manual", method, amount, reference: reference || null };
  },
};

export function getPaymentProvider(provider = "manual") {
  if (provider !== "manual") throw new Error("Only manual payment recording is available.");
  return manualProvider;
}
