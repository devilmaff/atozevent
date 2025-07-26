const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Submission = require('./models/Submission');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://A1events:UBbUmIMra0WYaF8O@a1events.7yipblv.mongodb.net/A1events?retryWrites=true&w=majority&appName=A1events');

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB Atlas');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Form submission route
app.post('/submit', async (req, res) => {
  const { name, email, mobile, message } = req.body;
  console.log('📨 Received:', req.body);
  try {
    await Submission.create({ name, email, mobile, message });
    console.log('✅ Saved to database');
    res.redirect('/success.html');
  } catch (err) {
    console.error('❌ Error saving submission:', err);
    res.status(500).send('Server Error');
  }
});

// ✅ View submissions
app.get('/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: 1 });

    let html = `
    <!DOCTYPE html><html lang="en"><head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Submissions</title>
    <style>
      body { font-family: Arial; background: #f2f2f2; padding: 20px; margin: 0; }
      h1 { text-align: center; color: maroon; }
      .table-view { display: none; width: 100%; border-collapse: collapse; }
      .table-view th, .table-view td {
        padding: 10px; border: 1px solid #ddd; text-align: left;
      }
      .card {
        background: white; margin: 15px auto; padding: 15px; border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2); max-width: 600px;
      }
      .card p {
  margin: 5px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

      .btn {
        padding: 8px 12px; border: none; cursor: pointer; font-weight: bold;
        border-radius: 5px; font-size: 0.9em;
      }
      .delete { background: #cc0000; color: white; }

      @media (min-width: 768px) {
        .card { display: none; }
        .table-view { display: table; }
      }

      @media (max-width: 767px) {
        .card { display: block; }
      }
    </style>
    </head><body>
    <h1>A1 Events Submissions</h1>

    <table class="table-view">
      <thead>
        <tr><th>Serial</th><th>Name</th><th>Email</th><th>Mobile</th><th>Message</th><th>Time</th><th>Action</th></tr>
      </thead><tbody>`;

    submissions.forEach((s, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${s.name}</td>
          <td>${s.email}</td>
          <td>${s.mobile}</td>
          <td>${s.message}</td>
          <td>${s.createdAt.toLocaleString()}</td>
          <td>
            <form method="POST" action="/delete/${s._id}">
              <button class="btn delete" type="submit">Delete</button>
            </form>
          </td>
        </tr>`;
    });

    html += `</tbody></table>`;

    // Mobile card layout
    submissions.forEach((s, i) => {
      html += `
        <div class="card">
          <p><strong>Serial:</strong> #${i + 1}</p>
          <p><strong>Name:</strong> ${s.name}</p>
          <p><strong>Email:</strong> ${s.email}</p>
          <p><strong>Mobile:</strong> ${s.mobile}</p>
          <p><strong>Message:</strong> ${s.message}</p>
          <p><strong>Time:</strong> ${s.createdAt.toLocaleString()}</p>
          <form method="POST" action="/delete/${s._id}">
            <button class="btn delete" type="submit">Delete</button>
          </form>
        </div>`;
    });

    html += `</body></html>`;
    res.send(html);

  } catch (err) {
    console.error('❌ Error loading submissions:', err);
    res.status(500).send('Error loading submissions');
  }
});

// ✅ Delete submission
app.post('/delete/:id', async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Deleted submission ${req.params.id}`);
    res.redirect('/submissions');
  } catch (err) {
    console.error('❌ Error deleting submission:', err);
    res.status(500).send('Delete failed');
  }
});

// ✅ Start the server
app.listen(3000, () => console.log("✅ Server running at https://atozevents.netlify.app/"));
