require('dotenv').config();
const app = require('./app');  // Import the configured Express app
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});