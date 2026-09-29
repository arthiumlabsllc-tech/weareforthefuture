"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { MAX_PESEWAS, PUBLIC_CASE_ID, type PublicBeneficiaryCase } from "@/lib/support-a-future/domain";

const publicSchema = z.object({
  publicId: z.string().regex(PUBLIC_CASE_ID), displayName: z.string(), age: z.number().int().nullable(),
  region: z.string(), needType: z.string(), needDescription: z.string(), storyShort: z.string(), storyFull: z.string().optional(),
  amountNeeded: z.number().int().min(1).max(MAX_PESEWAS), amountRaised: z.number().int().min(0).max(MAX_PESEWAS),
  photoUrl: z.null(), photoAlt: z.null(), status: z.string(),
}).strict().refine((row) => row.amountRaised <= row.amountNeeded);
export const pageSchema = z.object({ cases: z.array(publicSchema).max(20), nextCursor: z.string().max(400).nullable(), checkoutEnabled: z.boolean() }).strict();
export const detailSchema = z.object({ case: publicSchema, fundable: z.boolean(), checkoutEnabled: z.boolean() }).strict();
export type CasePage = { cases: PublicBeneficiaryCase[]; nextCursor: string | null; checkoutEnabled: boolean };
export type CaseDetail = { case: PublicBeneficiaryCase; fundable: boolean; checkoutEnabled: boolean };

export async function fetchCase(publicId: string, signal?: AbortSignal): Promise<CaseDetail | null> {
  const response = await fetch(`/api/support-a-future/cases/${encodeURIComponent(publicId)}`, { cache: "no-store", signal: signal ?? AbortSignal.timeout(15000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Case status could not be checked. Please try again.");
  return detailSchema.parse(await response.json());
}

type PaystackInstance = InstanceType<typeof import("@paystack/inline-js").default>;

// Own one provider attempt. SDK callbacks may run before resumeTransaction returns.
export function resumeCasePayment(instance: PaystackInstance, accessCode: string, onSuccess: () => void, onRestore: (message: string) => void) {
  let active = true;
  let cancelPending = false;
  let transaction: ReturnType<PaystackInstance["resumeTransaction"]> | null = null;
  const cancel = () => {
    cancelPending = true;
    if (transaction) {
      const current = transaction;
      transaction = null;
      try { instance.cancelTransaction(current); } catch { /* Keep status available even if provider cleanup fails. */ }
    }
  };
  const finish = (message?: string) => {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    if (message !== undefined) { cancel(); onRestore(message); }
    else onSuccess();
  };
  const timer = setTimeout(() => finish("Checkout took too long to load. Check payment status or resume the same payment."), 20000);
  try {
    transaction = instance.resumeTransaction(accessCode, {
      onLoad: () => { if (active) clearTimeout(timer); },
      onSuccess: () => finish(),
      onCancel: () => finish("Checkout closed. No payment is confirmed here. You can check its status or resume the same payment."),
      onError: () => finish("Checkout could not load. Your entries remain here. Check payment status before trying again."),
    });
    if (cancelPending) cancel();
  } catch {
    finish("Checkout could not open. Your entries remain here. Check payment status before trying again.");
  }
  return () => { active = false; clearTimeout(timer); cancel(); };
}

const subscribe = () => () => {};
export function useCaseHydrated() { return useSyncExternalStore(subscribe, () => true, () => false); }

// Discard case content while revalidating; an error is never an empty success.
export function useFreshCase(publicId: string, initial: CaseDetail | null, initialError = "") {
  const [detail, setDetail] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setDetail(null); setPending(true); setError("");
    try {
      const result = await fetchCase(publicId, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]));
      if (!controller.signal.aborted) setDetail(result);
    } catch { if (!controller.signal.aborted) setError("Case status could not be checked. Reconnect and try again."); }
    finally { if (!controller.signal.aborted) { setPending(false); request.current = null; } }
  }, [publicId]);
  useEffect(() => {
    const change = () => {
      if (document.hidden) { request.current?.abort(); setDetail(null); setPending(true); }
      else void refresh();
    };
    window.addEventListener("focus", change); window.addEventListener("pageshow", change);
    document.addEventListener("visibilitychange", change);
    return () => { request.current?.abort(); window.removeEventListener("focus", change); window.removeEventListener("pageshow", change); document.removeEventListener("visibilitychange", change); };
  }, [refresh]);
  return { detail, pending, error, refresh };
}
