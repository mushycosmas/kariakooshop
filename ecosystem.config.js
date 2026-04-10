module.exports = {
  apps: [
    {
      name: "kariakooshop",
      script: "npm",
      args: "start",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    }
  ]
};
