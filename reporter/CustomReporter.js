const fs = require('fs');
const path = require('path');

class CustomReporter {
  constructor() {
    this.results = [];
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
    });
  }

  onEnd() {
    const reportDirectory = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportDirectory)) {
      fs.mkdirSync(reportDirectory, { recursive: true });
    }

    const total = this.results.length;
    const passed = this.results.filter(
      test => test.status === 'passed'
    ).length;

    const failed = this.results.filter(
      test => test.status === 'failed'
    ).length;

    const skipped = this.results.filter(
      test => test.status === 'skipped'
    ).length;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ParaBank QA Automation Report</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      min-height: 100vh;
      padding: 40px;
      background: linear-gradient(135deg, #111827, #1f2937);
      color: white;
    }

    h1 {
      color: #F48031;
      margin-bottom: 30px;
    }

    .dashboard {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .card {
      min-width: 200px;
      padding: 25px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;

      background: rgba(255,255,255,0.10);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);

      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    }

    .card h2 {
      margin: 0;
      color: #F48031;
    }

    .card p {
      font-size: 28px;
      margin: 10px 0 0;
    }

    .test-list {
      margin-top: 30px;
    }

    .test {
      padding: 15px;
      margin-bottom: 10px;

      background: rgba(255,255,255,0.08);
      border-radius: 10px;
    }

    .passed {
      border-left: 5px solid #F48031;
    }

    .failed {
      border-left: 5px solid #ff4444;
    }

  </style>
</head>

<body>

  <h1>ParaBank QA Automation Dashboard</h1>

  <div class="dashboard">

    <div class="card">
      <h2>Total</h2>
      <p>${total}</p>
    </div>

    <div class="card">
      <h2>Passed</h2>
      <p>${passed}</p>
    </div>

    <div class="card">
      <h2>Failed</h2>
      <p>${failed}</p>
    </div>

    <div class="card">
      <h2>Skipped</h2>
      <p>${skipped}</p>
    </div>

  </div>

  <div class="test-list">

    ${this.results.map(test => `
      <div class="test ${test.status === 'passed' ? 'passed' : 'failed'}">
        <strong>${test.title}</strong>
        <br>
        Status: ${test.status}
        <br>
        Duration: ${test.duration} ms
      </div>
    `).join('')}

  </div>

</body>
</html>
`;

    const reportPath = path.join(
      reportDirectory,
      'index.html'
    );

    fs.writeFileSync(reportPath, html);

    console.log(`Custom report generated: ${reportPath}`);
  }
}

module.exports = CustomReporter;