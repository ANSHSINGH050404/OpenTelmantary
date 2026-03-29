import express from "express";
import httpProxy from "http-proxy";

const app = express();
const proxy = httpProxy.createProxyServer({});

const TARGET = "http://localhost:5000";

app.use((req, res) => {
  proxy.web(req, res, { target: TARGET });
});

app.listen(3000, () => {
  console.log("Sidecar running on port 3000");
});