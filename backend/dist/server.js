"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./config/data-source");
const PORT = process.env.PORT || 3000;
// Initialize DB connection first, then start accepting requests
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Database connected — tables synchronized');
    app_1.default.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
    .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
