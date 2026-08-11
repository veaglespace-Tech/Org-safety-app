require('dotenv').config();
const db = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
