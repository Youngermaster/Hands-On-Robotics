//! Module 05 — Project 01 — Telemetry ingest server.
//!
//! Accepts JSON heartbeats from the ESP32 firmware (POST /telemetry),
//! keeps the last [`HISTORY_CAP`] rows in memory, and serves a tiny HTML
//! index plus a JSON view for inspection.
//!
//! Bind address comes from the `BIND_ADDR` env var (default `0.0.0.0:8080`).

use std::{collections::VecDeque, fmt::Write, net::SocketAddr, sync::Arc};

use axum::{
    extract::State,
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::get,
    Json, Router,
};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;
use tracing::info;

/// How many telemetry rows we keep in memory.
const HISTORY_CAP: usize = 200;

/// Payload posted by the ESP32. All fields optional so a malformed
/// payload still deserialises rather than 400-ing — easier to debug
/// during firmware development.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Telemetry {
    chip: Option<String>,
    rev: Option<u32>,
    cores: Option<u32>,
    freq_mhz: Option<u32>,
    uptime_ms: Option<u64>,
    rssi: Option<i32>,
}

#[derive(Debug, Clone, Serialize)]
struct StoredTelemetry {
    received_at: String,
    #[serde(flatten)]
    payload: Telemetry,
}

#[derive(Clone, Default)]
struct AppState {
    history: Arc<Mutex<VecDeque<StoredTelemetry>>>,
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
        .route("/telemetry", get(list_telemetry).post(ingest_telemetry))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let bind = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    let addr: SocketAddr = bind.parse()?;
    let listener = TcpListener::bind(addr).await?;
    info!(%addr, "telemetry server listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
    info!("shutting down");
}

async fn ingest_telemetry(
    State(state): State<AppState>,
    Json(payload): Json<Telemetry>,
) -> impl IntoResponse {
    let stored = StoredTelemetry {
        received_at: now_rfc3339(),
        payload: payload.clone(),
    };
    info!(
        chip = ?payload.chip,
        rssi = ?payload.rssi,
        uptime_ms = ?payload.uptime_ms,
        "telemetry"
    );
    let mut q = state.history.lock();
    if q.len() >= HISTORY_CAP {
        q.pop_front();
    }
    q.push_back(stored);
    StatusCode::NO_CONTENT
}

async fn list_telemetry(State(state): State<AppState>) -> Json<Vec<StoredTelemetry>> {
    Json(state.history.lock().iter().cloned().collect())
}

async fn index_html(State(state): State<AppState>) -> Html<String> {
    let mut rows = String::new();
    for t in state.history.lock().iter().rev().take(20) {
        let _ = write!(
            rows,
            "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>",
            html_escape(&t.received_at),
            t.payload.chip.as_deref().unwrap_or("-"),
            fmt_opt(t.payload.uptime_ms),
            fmt_opt(t.payload.rssi),
            fmt_opt(t.payload.freq_mhz),
        );
    }

    Html(format!(
        r#"<!doctype html>
<meta charset="utf-8">
<title>m05/01 telemetry</title>
<style>
  body {{ font-family: ui-monospace, monospace; max-width: 960px; margin: 2em auto; padding: 0 1em; }}
  h1 {{ font-size: 1.2em; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ padding: 0.35em 0.6em; border-bottom: 1px solid #ddd; text-align: left; }}
  th {{ background: #f3f4f6; }}
  .empty {{ color: #888; font-style: italic; }}
</style>
<h1>ESP32 telemetry (last 20 of {HISTORY_CAP})</h1>
<p>Raw JSON at <a href="/telemetry">/telemetry</a>.</p>
<table>
  <thead><tr><th>received_at</th><th>chip</th><th>uptime_ms</th><th>rssi</th><th>freq_mhz</th></tr></thead>
  <tbody>
    {body}
  </tbody>
</table>
{empty}
"#,
        body = rows,
        empty = if state.history.lock().is_empty() {
            r#"<p class="empty">no telemetry yet — flash the ESP32 firmware.</p>"#
        } else {
            ""
        }
    ))
}

fn fmt_opt<T: std::fmt::Display>(v: Option<T>) -> String {
    v.map_or_else(|| "-".to_string(), |x| x.to_string())
}

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
