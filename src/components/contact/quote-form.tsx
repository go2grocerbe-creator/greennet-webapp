"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_METHOD_OPTIONS,
  HONEYPOT_FIELD_NAME,
  INTERESTED_SOLUTION_OPTIONS,
  PROJECT_TIMELINE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  quoteRequestSchema,
  type InterestedSolutionValue,
  type QuoteRequestInput,
  type QuoteRequestValues,
} from "@/lib/validation/quote-request";

import { TurnstileWidget } from "./turnstile-widget";

type QuoteFormProps = {
  turnstileSiteKey?: string;
  initialInterestedSolution?: InterestedSolutionValue;
};

type SubmitState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "success"; reference: string }
  | { phase: "error"; message: string };

const fieldLabels: Record<keyof QuoteRequestValues, string> = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  companyName: "Company name",
  location: "Location",
  propertyType: "Property type",
  interestedSolution: "Interested solution",
  electricityUsage: "Approximate electricity usage or monthly bill",
  preferredContactMethod: "Preferred contact method",
  projectTimeline: "Project timeline",
  message: "Message",
  privacyConsent: "Privacy consent",
};

function selectClassName() {
  return "h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";
}

export function QuoteForm({ turnstileSiteKey, initialInterestedSolution }: QuoteFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput, unknown, QuoteRequestValues>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      interestedSolution: initialInterestedSolution,
    },
    // We manage focus ourselves (move to the error summary, not the
    // first invalid field) — see onInvalid below.
    shouldFocusError: false,
  });

  const [submitState, setSubmitState] = useState<SubmitState>({ phase: "idle" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const handleVerify = useCallback((token: string) => setTurnstileToken(token), []);

  const errorEntries = Object.entries(errors) as [
    keyof QuoteRequestValues,
    { message?: string } | undefined,
  ][];

  // `isSubmitting`-driven disabling of the submit button (below) is the
  // duplicate-submission guard — a disabled button doesn't dispatch
  // click/submit events, so no separate ref-based lock is needed.
  const onValid = async (data: QuoteRequestValues) => {
    setSubmitState({ phase: "submitting" });

    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          [HONEYPOT_FIELD_NAME]: honeypotRef.current?.value ?? "",
          turnstileToken,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        reference?: string;
      };

      if (response.ok && payload.ok && payload.reference) {
        setSubmitState({ phase: "success", reference: payload.reference });
        reset();
      } else {
        setSubmitState({
          phase: "error",
          message: "We couldn't submit your enquiry. Please try again in a moment.",
        });
      }
    } catch {
      setSubmitState({
        phase: "error",
        message: "We couldn't reach the server. Check your connection and try again.",
      });
    }
  };

  const onInvalid = () => {
    // Deferred to the next macrotask so it runs after React has committed
    // and painted the error summary (which only renders once the failed
    // validation's `errors` state update lands) — see quote-form test
    // coverage for "logical focus movement after failure".
    setTimeout(() => errorSummaryRef.current?.focus(), 0);
  };

  if (submitState.phase === "success") {
    return (
      <div
        role="status"
        className="border-brand-primary/25 bg-brand-soft-green rounded-xl border p-8 text-center"
        data-testid="quote-form-success"
      >
        <span className="bg-brand-primary/10 text-brand-primary mx-auto flex size-12 items-center justify-center rounded-full">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="font-heading text-brand-deep-forest mt-4 text-xl font-semibold tracking-tight">
          Thanks — we&apos;ve received your enquiry
        </h2>
        <p className="text-muted-foreground mt-2">
          Reference <strong>{submitState.reference}</strong>. Someone from our team will follow up.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      // onValid/onInvalid only read refs inside their own bodies, which run on
      // submit, not during this render; the compiler's ref-safety heuristic
      // can't see through react-hook-form's handleSubmit(...) factory signature.
      // eslint-disable-next-line react-hooks/refs
      onSubmit={handleSubmit(onValid, onInvalid)}
      className="flex flex-col gap-6"
      aria-busy={isSubmitting}
    >
      {errorEntries.length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="border-destructive/40 bg-destructive/10 rounded-lg border p-4 outline-none"
        >
          <p className="text-destructive font-medium">
            Please fix the following {errorEntries.length === 1 ? "issue" : "issues"}:
          </p>
          <ul className="text-destructive mt-2 list-inside list-disc text-sm">
            {errorEntries.map(([field, error]) => (
              <li key={field}>
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => setFocus(field)}
                >
                  {fieldLabels[field]}: {error?.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitState.phase === "error" && (
        <div role="alert" className="border-destructive/40 bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive text-sm">{submitState.message}</p>
        </div>
      )}

      {/* Accessibly hidden honeypot trap — never shown, never tabbed to, never read by
          assistive tech. A real submitter never fills this in. */}
      <div style={{ position: "absolute", left: "-9999px", top: "auto" }} aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD_NAME}>Leave this field blank</label>
        <input
          ref={honeypotRef}
          id={HONEYPOT_FIELD_NAME}
          name={HONEYPOT_FIELD_NAME}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <fieldset className="flex flex-col gap-5">
        <legend className="sr-only">Your details</legend>
        <p
          aria-hidden="true"
          className="font-heading text-brand-deep-forest -mb-1 text-lg font-semibold tracking-tight"
        >
          Your details
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Full name <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="name"
              autoComplete="name"
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" className="text-destructive text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">
              Email address <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-destructive text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              {...register("phone")}
            />
            {errors.phone && (
              <p id="phone-error" className="text-destructive text-sm">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" autoComplete="organization" {...register("companyName")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" autoComplete="address-level2" {...register("location")} />
          </div>
        </div>
      </fieldset>

      <fieldset className="border-border flex flex-col gap-5 border-t pt-6">
        <legend className="sr-only">Project details</legend>
        <p
          aria-hidden="true"
          className="font-heading text-brand-deep-forest -mb-1 text-lg font-semibold tracking-tight"
        >
          Project details
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="propertyType">Property type</Label>
            <select id="propertyType" className={selectClassName()} {...register("propertyType")}>
              <option value="">Prefer not to say</option>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="interestedSolution">Interested solution</Label>
            <select
              id="interestedSolution"
              className={selectClassName()}
              {...register("interestedSolution")}
            >
              <option value="">Not sure yet</option>
              {INTERESTED_SOLUTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="electricityUsage">Approximate electricity usage or monthly bill</Label>
            <Input id="electricityUsage" {...register("electricityUsage")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferredContactMethod">Preferred contact method</Label>
            <select
              id="preferredContactMethod"
              className={selectClassName()}
              {...register("preferredContactMethod")}
            >
              <option value="">No preference</option>
              {CONTACT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="projectTimeline">Project timeline</Label>
            <select
              id="projectTimeline"
              className={selectClassName()}
              {...register("projectTimeline")}
            >
              <option value="">Not sure yet</option>
              {PROJECT_TIMELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="border-border flex flex-col gap-1.5 border-t pt-6">
        <Label htmlFor="message">
          Message <span aria-hidden="true">*</span>
        </Label>
        <p id="message-hint" className="text-muted-foreground text-xs">
          Tell us about your property and what you&apos;re looking for.
        </p>
        <Textarea
          id="message"
          rows={5}
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error message-hint" : "message-hint"}
          {...register("message")}
        />
        {errors.message && (
          <p id="message-error" className="text-destructive text-sm">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="privacyConsent"
          type="checkbox"
          className="border-input mt-0.5 size-5 rounded"
          aria-required="true"
          aria-invalid={Boolean(errors.privacyConsent)}
          aria-describedby={errors.privacyConsent ? "privacyConsent-error" : undefined}
          {...register("privacyConsent")}
        />
        <Label htmlFor="privacyConsent" className="font-normal">
          I agree to be contacted about this enquiry. <span aria-hidden="true">*</span>
        </Label>
      </div>
      {errors.privacyConsent && (
        <p id="privacyConsent-error" className="text-destructive -mt-4 text-sm">
          {errors.privacyConsent.message}
        </p>
      )}

      <TurnstileWidget siteKey={turnstileSiteKey} onVerify={handleVerify} />

      <div className="border-border flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          data-testid="quote-form-submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          size="lg"
          className="self-start"
        >
          {isSubmitting ? "Sending…" : "Send enquiry"}
        </Button>
        <p className="text-muted-foreground text-xs">
          <span aria-hidden="true">*</span> Required fields
        </p>
      </div>
    </form>
  );
}
