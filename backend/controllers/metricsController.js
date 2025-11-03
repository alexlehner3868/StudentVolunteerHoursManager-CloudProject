const axios = require("axios");
const fs = require("fs");
const { execSync } = require("child_process");

exports.getSystemMetrics = async (req, res) => {
  try {
    // --- Secrets ---
    const DO_API_TOKEN = fs.readFileSync("/run/secrets/do_api_token", "utf8").trim();
    const DROPLET_ID = fs.readFileSync("/run/secrets/droplet_id", "utf8").trim();
    const headers = { Authorization: `Bearer ${DO_API_TOKEN}` };

    // --- Time Window (last 5 minutes) ---
    const now = new Date();
    const start = new Date(now - 5 * 60 * 1000).toISOString();
    const end = now.toISOString();

    const metrics = {};

    // =====================================================
    // ✅ 1. CPU Usage via DigitalOcean API
    // =====================================================
    try {
      const cpuUrl = `https://api.digitalocean.com/v2/monitoring/metrics/droplet/cpu?host_id=${DROPLET_ID}&start=${start}&end=${end}`;
      const cpuResp = await axios.get(cpuUrl, { headers });

      const results = cpuResp.data.data.result;
      if (results && results.length > 0) {
        let user = 0,
          system = 0,
          idle = 0;

        for (const entry of results) {
          const mode = entry.metric.mode;
          const values = entry.values;
          if (!values?.length) continue;
          const diff =
            parseFloat(values.at(-1)[1]) - parseFloat(values[0][1]);
          if (mode === "user") user = diff;
          else if (mode === "system") system = diff;
          else if (mode === "idle") idle = diff;
        }

        const total = user + system + idle;
        metrics.cpu = total > 0 ? ((user + system) / total) * 100 : null;
      }
    } catch (err) {
      console.warn("⚠️ DigitalOcean CPU metric unavailable, falling back to local:", err.message);

      // Fallback CPU calculation (inside droplet)
      try {
        const stats1 = fs.readFileSync("/proc/stat", "utf8").split("\n")[0].split(/\s+/);
        const idle1 = parseInt(stats1[4]);
        const total1 = stats1.slice(1).reduce((a, b) => a + parseInt(b || 0), 0);

        await new Promise((resolve) => setTimeout(resolve, 100)); // short wait

        const stats2 = fs.readFileSync("/proc/stat", "utf8").split("\n")[0].split(/\s+/);
        const idle2 = parseInt(stats2[4]);
        const total2 = stats2.slice(1).reduce((a, b) => a + parseInt(b || 0), 0);

        const idleDiff = idle2 - idle1;
        const totalDiff = total2 - total1;
        metrics.cpu = ((1 - idleDiff / totalDiff) * 100).toFixed(2);
      } catch {
        metrics.cpu = null;
      }
    }

    // =====================================================
    // ✅ 2. Memory Metrics (DigitalOcean API)
    // =====================================================
    const memTypes = ["memory_total", "memory_free"];
    for (const type of memTypes) {
      const url = `https://api.digitalocean.com/v2/monitoring/metrics/droplet/${type}?host_id=${DROPLET_ID}&start=${start}&end=${end}`;
      try {
        const resp = await axios.get(url, { headers });
        const values = resp.data.data.result[0]?.values || [];
        metrics[type] = values.length > 0 ? parseFloat(values.at(-1)[1]) : null;
      } catch {
        metrics[type] = null;
      }
    }

    const total = metrics.memory_total || 1;
    const used = total - (metrics.memory_free || 0);
    const memUsage = (used / total) * 100;

    // =====================================================
    // ✅ 3. Disk Usage (Local df)
    // =====================================================
    const getDiskUsage = (mountPath = "/") => {
      try {
        const output = execSync(`df -h ${mountPath} | tail -1`).toString().split(/\s+/);
        if (!output[4]) return null;
        return parseFloat(output[4].replace("%", ""));
      } catch {
        return null;
      }
    };

    const systemDisk = getDiskUsage("/");
    const volumeDisk = getDiskUsage("/mnt/volume_tor1");

    // =====================================================
    // ✅ 4. Network Usage (Local /proc/net/dev)
    // =====================================================
    const getNetworkUsage = () => {
      try {
        const output = execSync("cat /proc/net/dev | grep eth0").toString().trim().split(/\s+/);
        const rxBytes = parseFloat(output[1]) / 1024 / 1024; // MB received
        const txBytes = parseFloat(output[9]) / 1024 / 1024; // MB sent
        return { rx: rxBytes.toFixed(2), tx: txBytes.toFixed(2) };
      } catch {
        return { rx: null, tx: null };
      }
    };
    const net = getNetworkUsage();

    // =====================================================
    // ✅ 5. Send JSON Response
    // =====================================================
    res.json({
      cpu: metrics.cpu ? parseFloat(metrics.cpu).toFixed(2) : "N/A",
      memory: memUsage.toFixed(2),
      disk_system: systemDisk?.toFixed(2),
      disk_volume: volumeDisk?.toFixed(2),
      network_in_mb: net.rx,
      network_out_mb: net.tx,
      timestamp: end,
    });
  } catch (error) {
    console.error("❌ Error fetching metrics:", error.message);
    res.status(500).json({ error: "Failed to retrieve metrics" });
  }
};
