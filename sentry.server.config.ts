import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8fc3ebf4a455214f05e8b5d968c2bd82@o4511065027641345.ingest.de.sentry.io/4511065031376976",
  tracesSampleRate: 0.1,
});
