## Ziele
- Robust, konsistenter Flow für Registrierung/Login inkl. E‑Mail‑Bestätigung.
- Saubere Zustandsmaschine: kein Fortschritt ohne Verifizierung, keine Dead‑Ends.
- UI nach Vorgaben: Liquid Glass, ruhige Typografie, klare Button‑Hierarchie.
- Stabiles Session‑Handling und Redirects.
- Vollständiges Error‑Handling und automatisierte Tests.

## Analyse (Ist‑Stand)
- Supabase‑Auth vorhanden (Server: `src/lib/supabaseServer.ts`, Client: `src/lib/supabaseClient.ts`).
- Onboarding‑Wizard enthält Schritt `"email-confirm"` mit Resend und Platzhalter für Code‑Verifikation (`src/components/OnboardingWizard.tsx`).
- Server Actions und Guards existieren (`src/lib/loginAction.ts`, `src/lib/auth.ts`).
- Redirects über Serverseiten (`src/app/onboarding/page.tsx`, `src/app/page.tsx`) und Client (`router.push`).
- E‑Mail‑Resend über `supabaseBrowser.auth.resend({ type: "signup", email })`.

## Probleme (zu beheben)
- Doppelter Bestätigungstext, unlogische/gedrängte Buttons.
- Fortschritt möglich/gesperrt trotz fehlender Verifizierung.
- Code‑Fallback fehlt (nur Platzhalter).
- Session‑Verlust/fehlerhafte Redirects.

## Technische Umsetzung
### 1) Zustandsmaschine & Flow absichern
- Einheitlichen Onboarding‑State konsolidieren: `no-session` → `email-unconfirmed` → `ready`.
- Gating: Schritte nach `"email-confirm"` nur bei `email_confirmed_at` vorhanden.
- Polling + Auth‑Hook: während `"email-confirm"` zyklisch `auth.getUser()` prüfen und zusätzlich `onAuthStateChange` nutzen.
- Einheitliche Weiterleitung: bei Erfolg → `/app-home`, sonst im Schritt verbleiben.

### 2) Code‑Fallback implementieren
- UI: Eingabefeld für Verifikationscode + „Code prüfen“.
- Logik: `supabaseBrowser.auth.verifyOtp({ email, token, type: "signup" })` verwenden; Erfolg → Session prüfen und weiterleiten.
- Fehlerfälle: klar kommunizieren (ungültiger/abgelaufener Code), erneut versuchen ermöglichen.

### 3) Resend & Rate‑Limit
- Button „Bestätigung erneut senden“ ruft `auth.resend({ type: "signup", email })`.
- Kleine Rate‑Limit/Kühlzeit (z. B. 30–60 Sek.) clientseitig.
- Eindeutige Rückmeldung ohne Duplikate.

### 4) Session‑ und Redirect‑Stabilität
- Serverseitig: `middleware.ts` Session‑Sync beibehalten; bei `/onboarding` Guards nutzen (`src/lib/auth.ts`).
- Server Action `loginAction.ts`: nach Login → `redirect("/app-home")`; nach Signup → `requiresEmailConfirm: true` und Schritt `"email-confirm"` erzwingen.
- Callback‑Route (OAuth/Magic‑Link): `exchangeCodeForSession` → gezielte Redirects auf `/onboarding` wenn Profil unvollständig, sonst `/app-home`.

### 5) UI‑Redesign „Apple‑like Liquid Glass“
- Eigenständige Komponente `StepEmailConfirm` mit breiterem Container, hoher Lesbarkeit.
- Liquid‑Glass: Hintergrundunschärfe, semitransparente Flächen, keine Gradients.
- Typografie: ruhige, moderne Schrift (bestehende Font nutzen), größere Zeilenhöhe, klare Hierarchie.
- Buttons: Primary (deutlich, z. B. „Status prüfen“), Secondary (minimalistisch: „Bestätigung erneut senden“), Tertiary (Link‑Stil: „Code eingeben“).
- Keine doppelten Texte; klare, knappe Copy.

### 6) Fehler‑ und Edge‑Case‑Handling
- Netzwerkfehler, abgelaufene Token, bereits bestätigte E‑Mail, falsche E‑Mail.
- Einheitliche Fehlermeldungen mit nicht‑technischer Sprache.
- Loading‑Zustände, Disabled‑Buttons während Requests.

### 7) Tests
- Unit: Auth‑Hilfsfunktionen (`authClient`, State‑Guards) mit Mocking des Supabase‑Clients.
- Integration: Schritt `"email-confirm"` – Resend, Code‑Verifikation, Polling/Hook.
- E2E: Registrierung → E‑Mail‑Bestätigung (simuliert) → Profil‑Flow → `/app-home`.
- Automatisches Laufen in CI/ lokal; Iteration bis grün.

## Deliverables
- Neue/überarbeitete Komponenten: `StepEmailConfirm` + Layout‑Styles.
- Aktualisierte Logik im Wizard und Guards.
- Stabilisierte Server Actions/Redirects.
- Vollständige Testsuite.

## Akzeptanzkriterien
- Kein doppelter Text; UI entspricht Vorgaben.
- Kein Fortschritt ohne bestätigte E‑Mail; Sessions bleiben erhalten.
- Resend und Code‑Fallback funktionieren mit klaren Rückmeldungen.
- Tests bestehen; manuelle Klickstrecke fühlt sich glatt und konsistent an.

Bitte bestätigen, dann implementiere ich die Änderungen, führe Tests aus und iteriere bis alles stabil ist.