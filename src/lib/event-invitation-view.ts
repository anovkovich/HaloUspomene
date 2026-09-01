/**
 * The shape the event-invitation renderer draws — deliberately NOT tied to any
 * one collection.
 *
 * `PunoletstvoInvitationClient` is typed against `BirthdayData`, which is why
 * it cannot be reused for anything else. This view model exists so the same
 * renderer can serve:
 *   - a corporate event, mapped from `standalone_seatings`, and
 *   - a milestone birthday (30/40/50), mapped from `birthday_events`
 * without either collection leaking into the component.
 *
 * Keep it a plain data type: no Mongo imports, so client components can import
 * it freely.
 */

export interface EventInvitationViewLocation {
  name: string;
  address: string;
  mapUrl?: string;
}

export interface EventInvitationViewAgendaItem {
  time: string;
  title: string;
}

export interface EventInvitationView {
  /** Headline — a company, or the person being celebrated. */
  title: string;
  /** Small line under the headline, e.g. "Godišnjica 10 godina". */
  subtitle?: string;
  /** Large decorative number for a milestone birthday ("50"). Corporate
   *  invitations omit it. */
  displayNumber?: string;
  /** ISO date, "YYYY-MM-DD". */
  date: string;
  /** "HH:MM", kept separate from `date` — see StandaloneSeating.eventTime. */
  time?: string;
  location?: EventInvitationViewLocation;
  agenda?: EventInvitationViewAgendaItem[];
  dressCode?: string;
  tagline?: string;
  /** Theme key; the renderer resolves it to colors. */
  theme: string;
  /** Which RSVP flow the invitation posts to. */
  rsvp: {
    slug: string;
    kind: "standalone" | "birthday";
    /** ISO date; empty/absent ⇒ no deadline. */
    submitUntil?: string;
  };
}
