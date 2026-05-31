//! Module 05 — Project 02 — Bidirectional control server.
//!
//! Endpoints:
//!   GET  /            -> HTML control panel
//!   GET  /events      -> JSON array of recent button events
//!   POST /events      -> record a button event   (called by the ESP32)
//!   GET  /led         -> JSON `{ "on": bool }`   (polled by the ESP32)
//!   POST /led         -> set desired LED state (`application/json` or form)
//!
//! State is in-memory only — restart and you start clean.

use std::{collections::VecDeque, fmt::Write, net::SocketAddr, sync::Arc};

use axum::{
    extract::State,
    http::StatusCode,
    response::{Html, IntoResponse, Redirect},
    routing::{get, post},
    Form, Json, Router,
};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;
use tracing::info;

const EVENT_HISTORY_CAP: usize = 200;

#[derive(Debug, Clone, Deserialize)]
struct EventIn {
    event: String,
    uptime_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
struct StoredEvent {
    received_at: String,
    event: String,
    uptime_ms: Option<u64>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct LedState {
    on: bool,
}

#[derive(Clone, Default)]
struct AppState {
    events: Arc<Mutex<VecDeque<StoredEvent>>>,
    led: Arc<Mutex<LedState>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let state = AppState::default();
    let app = Router::new()
        .route("/", get(index_html))
        .route("/events", get(list_events).post(ingest_event))
        .route("/led", get(get_led).post(set_led))
        .route("/led/form", post(set_led_form))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let bind = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    let addr: SocketAddr = bind.parse()?;
    let listener = TcpListener::bind(addr).await?;
    info!(%addr, "bidirectional-control server listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
    info!("shutting down");
}

// --- /events ----------------------------------------------------------------

async fn ingest_event(
    State(state): State<AppState>,
    Json(payload): Json<EventIn>,
) -> impl IntoResponse {
    let stored = StoredEvent {
        received_at: now_rfc3339(),
        event: payload.event,
        uptime_ms: payload.uptime_ms,
    };
    info!(event = %stored.event, uptime_ms = ?stored.uptime_ms, "event");
    let mut q = state.events.lock();
    if q.len() >= EVENT_HISTORY_CAP {
        q.pop_front();
    }
    q.push_back(stored);
    StatusCode::NO_CONTENT
}

async fn list_events(State(state): State<AppState>) -> Json<Vec<StoredEvent>> {
    Json(state.events.lock().iter().cloned().collect())
}

// --- /led -------------------------------------------------------------------

async fn get_led(State(state): State<AppState>) -> Json<LedState> {
    Json(state.led.lock().clone())
}

async fn set_led(State(state): State<AppState>, Json(body): Json<LedState>) -> Json<LedState> {
    info!(on = body.on, "led set (json)");
    *state.led.lock() = body.clone();
    Json(body)
}

/// HTML form action — the browser POSTs `application/x-www-form-urlencoded`
/// with a single `on` field. Redirects back to `/` so the browser
/// re-renders the page.
#[derive(Debug, Deserialize)]
struct LedForm {
    on: String,
}

async fn set_led_form(State(state): State<AppState>, Form(form): Form<LedForm>) -> Redirect {
    let on = matches!(form.on.as_str(), "1" | "true" | "on");
    info!(on, raw = %form.on, "led set (form)");
    *state.led.lock() = LedState { on };
    Redirect::to("/")
}

// --- HTML index -------------------------------------------------------------

async fn index_html(State(state): State<AppState>) -> Html<String> {
    let led = state.led.lock().clone();
    let mut events = String::new();
    for e in state.events.lock().iter().rev().take(30) {
        let _ = write!(
            events,
            "<tr><td>{}</td><td>{}</td><td>{}</td></tr>",
            html_escape(&e.received_at),
            html_escape(&e.event),
            e.uptime_ms
                .map_or_else(|| "-".to_string(), |x| x.to_string()),
        );
    }

    let badge = if led.on {
        r#"<span style="color:#fff;background:#22c55e;padding:0.2em 0.6em;border-radius:4px">ON</span>"#
    } else {
        r#"<span style="color:#fff;background:#475569;padding:0.2em 0.6em;border-radius:4px">OFF</span>"#
    };

    Html(format!(
        r#"<!doctype html>
<meta charset="utf-8">
<title>m05/02 control</title>
<style>
  body {{ font-family: ui-monospace, monospace; max-width: 960px; margin: 2em auto; padding: 0 1em; }}
  h1 {{ font-size: 1.2em; }}
  form {{ display: inline; }}
  button {{ font-family: inherit; padding: 0.4em 0.9em; cursor: pointer; }}
  table {{ border-collapse: collapse; width: 100%; margin-top: 1em; }}
  th, td {{ padding: 0.35em 0.6em; border-bottom: 1px solid #ddd; text-align: left; }}
  th {{ background: #f3f4f6; }}
  .row {{ display: flex; gap: 1em; align-items: center; margin-bottom: 1em; }}
</style>
<h1>ESP32 control</h1>

<div class="row">
  <div>LED is {badge}</div>
  <form method="post" action="/led/form"><input type="hidden" name="on" value="true"><button>Turn ON</button></form>
  <form method="post" action="/led/form"><input type="hidden" name="on" value="false"><button>Turn OFF</button></form>
</div>

<p>JSON endpoints:
  <a href="/led">/led</a>,
  <a href="/events">/events</a>.
Curl:
<code>curl -X POST .../led -H 'content-type: application/json' -d '{{"on":true}}'</code>.</p>

<h2>Recent events (last 30)</h2>
<table>
  <thead><tr><th>received_at</th><th>event</th><th>uptime_ms</th></tr></thead>
  <tbody>
    {events}
  </tbody>
</table>
"#,
        badge = badge,
        events = if events.is_empty() {
            r#"<tr><td colspan="3" style="font-style:italic;color:#888">no events yet</td></tr>"#
                .to_string()
        } else {
            events
        },
    ))
}

// --- helpers ----------------------------------------------------------------

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

fn now_rfc3339() -> String {
    use time::{format_description::well_known::Rfc3339, OffsetDateTime};
    OffsetDateTime::now_utc()
        .format(&Rfc3339)
        .unwrap_or_else(|_| String::from("?"))
}
