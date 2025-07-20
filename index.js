const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Method 1
const nDate = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Jakarta'
});

console.log(nDate);
